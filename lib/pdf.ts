import { jsPDF } from "jspdf";

interface InvoiceItem {
  id: string;
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  notes: string | null;
  termsAndConditions: string | null;
  customer: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
  };
  job: { jobNumber: string; itemDescription: string } | null;
  items: InvoiceItem[];
  payments: Payment[];
}

interface CompanyData {
  companyName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxNumber: string | null;
}

function formatItemType(type: string) {
  switch (type) {
    case "PART":
      return "Part";
    case "LABOUR":
      return "Labour";
    case "SERVICE":
      return "Service";
    case "TECHNICAL_CHARGE":
      return "Tech Charge";
    case "TRANSPORT":
      return "Transport";
    case "SUNDRY":
      return "Sundry";
    default:
      return type;
  }
}

function fmtCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function generateInvoicePDF(invoice: InvoiceData, company: CompanyData | null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Company Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company?.companyName || "Company Name", 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (company?.address) {
    const addressLines = company.address.split("\n");
    for (const line of addressLines) {
      doc.text(line, 14, y);
      y += 4;
    }
  }
  if (company?.phone) {
    doc.text(`Phone: ${company.phone}`, 14, y);
    y += 4;
  }
  if (company?.email) {
    doc.text(`Email: ${company.email}`, 14, y);
    y += 4;
  }
  if (company?.taxNumber) {
    doc.text(`Tax No: ${company.taxNumber}`, 14, y);
    y += 4;
  }

  // Divider line
  y += 2;
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Invoice Title and Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, y);

  // Invoice details on the right
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const rightX = pageWidth - 14;
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, rightX, y - 4, { align: "right" });
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, rightX, y, { align: "right" });
  if (invoice.dueDate) {
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, rightX, y + 4, { align: "right" });
  }
  y += 10;

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoice.customer.name, 14, y);
  y += 4;
  doc.setFontSize(9);
  if (invoice.customer.address) {
    const custAddr = invoice.customer.address.split("\n");
    for (const line of custAddr) {
      doc.text(line, 14, y);
      y += 4;
    }
  }
  if (invoice.customer.phone) {
    doc.text(`Phone: ${invoice.customer.phone}`, 14, y);
    y += 4;
  }
  if (invoice.customer.email) {
    doc.text(`Email: ${invoice.customer.email}`, 14, y);
    y += 4;
  }

  // Job Reference
  if (invoice.job) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text(`Job Ref: ${invoice.job.jobNumber} - ${invoice.job.itemDescription}`, 14, y);
    doc.setFont("helvetica", "normal");
    y += 4;
  }

  y += 4;

  // Line Items Table Header
  const colX = [14, 24, 90, 120, 140, 165];
  const colWidths = [10, 66, 30, 20, 25, 31];
  doc.setFillColor(40, 40, 40);
  doc.rect(14, y - 4, pageWidth - 28, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("S.No", colX[0] + 1, y);
  doc.text("Description", colX[1] + 1, y);
  doc.text("Type", colX[2] + 1, y);
  doc.text("Qty", colX[3] + colWidths[3] - 2, y, { align: "right" });
  doc.text("Rate", colX[4] + colWidths[4] - 2, y, { align: "right" });
  doc.text("Amount", colX[5] + colWidths[5] - 2, y, { align: "right" });
  y += 6;

  // Table Rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(i + 1), colX[0] + 1, y);
    const desc = item.description.length > 40 ? item.description.substring(0, 40) + "..." : item.description;
    doc.text(desc, colX[1] + 1, y);
    doc.text(formatItemType(item.type), colX[2] + 1, y);
    doc.text(String(item.quantity), colX[3] + colWidths[3] - 2, y, { align: "right" });
    doc.text(item.unitPrice.toFixed(2), colX[4] + colWidths[4] - 2, y, { align: "right" });
    doc.text(item.amount.toFixed(2), colX[5] + colWidths[5] - 2, y, { align: "right" });

    // Light separator
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(14, y, pageWidth - 14, y);
    y += 4;
  }

  y += 4;

  // Totals section
  const totalsX = pageWidth - 80;
  doc.setFontSize(9);

  doc.text("Subtotal:", totalsX, y);
  doc.text(fmtCurrency(invoice.subtotal), pageWidth - 14, y, { align: "right" });
  y += 5;

  if (invoice.discountPercent > 0) {
    doc.text(`Discount (${invoice.discountPercent}%):`, totalsX, y);
    doc.setTextColor(200, 0, 0);
    doc.text(`- ${fmtCurrency(invoice.discountAmount)}`, pageWidth - 14, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 5;
  }

  if (invoice.taxPercent > 0) {
    doc.text(`Tax/VAT (${invoice.taxPercent}%):`, totalsX, y);
    doc.text(fmtCurrency(invoice.taxAmount), pageWidth - 14, y, { align: "right" });
    y += 5;
  }

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, pageWidth - 14, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total:", totalsX, y);
  doc.text(fmtCurrency(invoice.grandTotal), pageWidth - 14, y, { align: "right" });
  y += 8;

  // Payment Status
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.round((invoice.grandTotal - paidAmount + Number.EPSILON) * 100) / 100;
  doc.text(`Total Paid: ${fmtCurrency(paidAmount)}`, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Balance Due: ${fmtCurrency(balanceDue)}`, pageWidth - 14, y, { align: "right" });
  y += 8;

  // Terms & Conditions
  if (invoice.termsAndConditions) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Terms & Conditions:", 14, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const terms = doc.splitTextToSize(invoice.termsAndConditions, pageWidth - 28);
    doc.text(terms, 14, y);
    y += terms.length * 3.5 + 4;
  }

  // Signature area
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  const sigWidth = (pageWidth - 28 - 20) / 3;
  const sigLabels = ["Prepared By", "Checked By", "Approved By"];
  for (let i = 0; i < 3; i++) {
    const x = 14 + i * (sigWidth + 10);
    doc.line(x, y + 12, x + sigWidth, y + 12);
    doc.setFontSize(8);
    doc.text(sigLabels[i], x + sigWidth / 2, y + 16, { align: "center" });
  }

  // Footer
  y += 28;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business!", pageWidth / 2, y, { align: "center" });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
