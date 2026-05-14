"use server";

import prisma from "@/lib/prisma";

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export async function getSalesReport(
  period: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
  startDate?: string,
  endDate?: string
) {
  const conditions: object[] = [{ status: "PAID" }];

  if (startDate) {
    conditions.push({ invoiceDate: { gte: new Date(startDate) } });
  }
  if (endDate) {
    conditions.push({ invoiceDate: { lte: new Date(endDate + "T23:59:59") } });
  }

  const where = { AND: conditions };

  const invoices = await prisma.invoice.findMany({
    where,
    select: { invoiceDate: true, grandTotal: true },
    orderBy: { invoiceDate: "asc" },
  });

  // Group by period
  const grouped: Record<string, { revenue: number; count: number }> = {};

  for (const inv of invoices) {
    const date = new Date(inv.invoiceDate);
    let key: string;

    switch (period) {
      case "daily":
        key = date.toISOString().split("T")[0];
        break;
      case "weekly": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
        break;
      }
      case "monthly":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "yearly":
        key = `${date.getFullYear()}`;
        break;
    }

    if (!grouped[key]) {
      grouped[key] = { revenue: 0, count: 0 };
    }
    grouped[key].revenue = round2(grouped[key].revenue + inv.grandTotal);
    grouped[key].count += 1;
  }

  const data = Object.entries(grouped).map(([period, values]) => ({
    period,
    revenue: values.revenue,
    count: values.count,
  }));

  const totalRevenue = round2(invoices.reduce((sum, inv) => sum + inv.grandTotal, 0));
  const totalInvoices = invoices.length;
  const averageValue = totalInvoices > 0 ? round2(totalRevenue / totalInvoices) : 0;

  return { data, totalRevenue, totalInvoices, averageValue };
}

export async function getPendingPaymentsReport() {
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"] },
    },
    include: {
      customer: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const report = invoices.map((inv) => {
    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = round2(inv.grandTotal - totalPaid);
    const daysOverdue = inv.dueDate
      ? Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      grandTotal: inv.grandTotal,
      amountDue,
      dueDate: inv.dueDate,
      daysOverdue,
      status: inv.status,
    };
  });

  // Sort by most overdue first
  report.sort((a, b) => b.daysOverdue - a.daysOverdue);

  const totalOutstanding = round2(report.reduce((sum, r) => sum + r.amountDue, 0));
  const overdueCount = report.filter((r) => r.daysOverdue > 0).length;
  const avgDaysOverdue =
    overdueCount > 0
      ? Math.round(
          report.filter((r) => r.daysOverdue > 0).reduce((sum, r) => sum + r.daysOverdue, 0) / overdueCount
        )
      : 0;

  return { invoices: report, totalOutstanding, overdueCount, avgDaysOverdue };
}

export async function getCustomerReport(customerId?: string) {
  const customers = await prisma.customer.findMany({
    where: customerId ? { id: customerId } : {},
    include: {
      invoices: {
        select: { grandTotal: true, status: true, invoiceDate: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    totalInvoices: customer.invoices.length,
    totalAmount: round2(customer.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)),
    paidAmount: round2(
      customer.invoices
        .filter((inv) => inv.status === "PAID")
        .reduce((sum, inv) => sum + inv.grandTotal, 0)
    ),
  }));
}

export async function getJobReport(status?: string, startDate?: string, endDate?: string) {
  const conditions: object[] = [];

  if (status) {
    conditions.push({ status });
  }
  if (startDate) {
    conditions.push({ date: { gte: new Date(startDate) } });
  }
  if (endDate) {
    conditions.push({ date: { lte: new Date(endDate + "T23:59:59") } });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const jobs = await prisma.job.findMany({
    where,
    select: { status: true },
  });

  const statusCounts: Record<string, number> = {};
  for (const job of jobs) {
    statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
  }

  return {
    total: jobs.length,
    statusCounts,
  };
}

export async function getInventoryReport() {
  // Parts usage from invoice items
  const partItems = await prisma.invoiceItem.findMany({
    where: { type: "PART", partId: { not: null } },
    include: {
      part: { select: { name: true, unitPrice: true, costPrice: true, quantity: true } },
    },
  });

  // Aggregate usage by part
  const usage: Record<string, { name: string; quantityUsed: number; revenue: number }> = {};
  for (const item of partItems) {
    if (!item.part) continue;
    const key = item.partId!;
    if (!usage[key]) {
      usage[key] = { name: item.part.name, quantityUsed: 0, revenue: 0 };
    }
    usage[key].quantityUsed += item.quantity;
    usage[key].revenue = round2(usage[key].revenue + item.amount);
  }

  const topUsedParts = Object.values(usage)
    .sort((a, b) => b.quantityUsed - a.quantityUsed)
    .slice(0, 10);

  // Current stock value
  const allParts = await prisma.part.findMany({
    select: { name: true, quantity: true, unitPrice: true, costPrice: true },
    orderBy: { name: "asc" },
  });

  const stockItems = allParts.map((part) => ({
    name: part.name,
    quantity: part.quantity,
    unitPrice: part.unitPrice,
    totalValue: round2(part.quantity * part.costPrice),
  }));

  const totalInventoryValue = round2(stockItems.reduce((sum, p) => sum + p.totalValue, 0));

  return { topUsedParts, stockItems, totalInventoryValue };
}

export async function getProfitReport(startDate?: string, endDate?: string) {
  const conditions: object[] = [{ status: "PAID" }];

  if (startDate) {
    conditions.push({ invoiceDate: { gte: new Date(startDate) } });
  }
  if (endDate) {
    conditions.push({ invoiceDate: { lte: new Date(endDate + "T23:59:59") } });
  }

  const where = { AND: conditions };

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      items: {
        include: {
          part: { select: { costPrice: true } },
        },
      },
    },
  });

  let totalIncome = 0;
  let totalPartsCost = 0;

  const monthlyData: Record<string, { income: number; costs: number }> = {};

  for (const inv of invoices) {
    totalIncome += inv.grandTotal;
    const monthKey = `${new Date(inv.invoiceDate).getFullYear()}-${String(new Date(inv.invoiceDate).getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, costs: 0 };
    }
    monthlyData[monthKey].income = round2(monthlyData[monthKey].income + inv.grandTotal);

    for (const item of inv.items) {
      if (item.type === "PART" && item.part) {
        const cost = item.part.costPrice * item.quantity;
        totalPartsCost += cost;
        monthlyData[monthKey].costs = round2(monthlyData[monthKey].costs + cost);
      }
    }
  }

  totalIncome = round2(totalIncome);
  totalPartsCost = round2(totalPartsCost);
  const grossProfit = round2(totalIncome - totalPartsCost);
  const profitMargin = totalIncome > 0 ? round2((grossProfit / totalIncome) * 100) : 0;

  const chartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, values]) => ({
      month,
      income: values.income,
      costs: values.costs,
      profit: round2(values.income - values.costs),
    }));

  return { totalIncome, totalPartsCost, grossProfit, profitMargin, chartData };
}
