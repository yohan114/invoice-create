"use server";

import prisma from "@/lib/prisma";

export interface DashboardMetrics {
  totalSales: number;
  pendingInvoices: number;
  completedJobs: number;
  jobsInProgress: number;
  lowStockParts: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  status: string;
  invoiceDate: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [paidInvoices, pendingInvoices, completedJobs, jobsInProgress, lowStockParts] =
    await Promise.all([
      prisma.invoice.aggregate({
        _sum: { grandTotal: true },
        where: { status: "PAID" },
      }),
      prisma.invoice.count({
        where: { status: { in: ["DRAFT", "SENT", "OVERDUE"] } },
      }),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.job.count({ where: { status: "IN_PROGRESS" } }),
      prisma.$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM Part WHERE quantity <= reorderLevel`
      ),
    ]);

  return {
    totalSales: paidInvoices._sum.grandTotal || 0,
    pendingInvoices,
    completedJobs,
    jobsInProgress,
    lowStockParts: Number(lowStockParts[0]?.count || 0),
  };
}

export async function getRecentInvoices(): Promise<RecentInvoice[]> {
  const invoices = await prisma.invoice.findMany({
    take: 10,
    orderBy: { invoiceDate: "desc" },
    include: { customer: { select: { name: true } } },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customer.name,
    grandTotal: inv.grandTotal,
    status: inv.status,
    invoiceDate: inv.invoiceDate.toISOString().split("T")[0],
  }));
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const paidInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      invoiceDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: {
      invoiceDate: true,
      grandTotal: true,
    },
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyData: MonthlyRevenue[] = months.map((month) => ({
    month,
    revenue: 0,
  }));

  for (const invoice of paidInvoices) {
    const monthIndex = invoice.invoiceDate.getMonth();
    monthlyData[monthIndex].revenue += invoice.grandTotal;
  }

  return monthlyData;
}
