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
  invoiceType: string;
  status: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  ssclPercent: number;
  ssclAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  notes: string | null;
  termsAndConditions: string | null;
  poNumber: string | null;
  poDate: string | null;
  deliveryDate: string | null;
  grnNumber: string | null;
  paymentTerms: string | null;
  referenceNumber: string | null;
  deliveryAddress: string | null;
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
  companySubtitle: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxNumber: string | null;
  website: string | null;
  faxNumber: string | null;
  footerDetails: string | null;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function groupItemsByType(items: InvoiceItem[]) {
  const groups: { label: string; items: InvoiceItem[] }[] = [];

  const partItems = items.filter((i) => i.type === "PART");
  const serviceItems = items.filter((i) => i.type === "SERVICE");
  const labourItems = items.filter((i) => i.type === "LABOUR");
  const otherItems = items.filter(
    (i) =>
      i.type === "TECHNICAL_CHARGE" ||
      i.type === "TRANSPORT" ||
      i.type === "SUNDRY"
  );

  if (partItems.length > 0) groups.push({ label: "Parts", items: partItems });
  if (serviceItems.length > 0) groups.push({ label: "Services", items: serviceItems });
  if (labourItems.length > 0) groups.push({ label: "Labour", items: labourItems });
  if (otherItems.length > 0) groups.push({ label: "Technical Charges & Other", items: otherItems });

  return groups;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 270) {
    doc.addPage();
    return 15;
  }
  return y;
}

export function generateInvoicePDF(invoice: InvoiceData, company: CompanyData | null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = 12;

  // ===== HEADER: Logo left, company name center, logo right =====
  const headerHeight = 18;
  const logoSize = 14;

  if (company?.logo) {
    try {
      const logoData = company.logo;
      const format = logoData.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(logoData, format, margin, y, logoSize, logoSize);
      doc.addImage(logoData, format, pageWidth - margin - logoSize, y, logoSize, logoSize);
    } catch {
      // Skip logo if it fails to load
    }
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(company?.companyName || "Company Name", pageWidth / 2, y + 6, { align: "center" });

  if (company?.companySubtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(company.companySubtitle, pageWidth / 2, y + 12, { align: "center" });
  }

  y += headerHeight + 4;

  // ===== TITLE: Invoice type in bordered box =====
  const titleBoxHeight = 10;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, titleBoxHeight);

  const invoiceTitle = invoice.invoiceType === "TAX_INVOICE" ? "TAX INVOICE" : "PROFORMA INVOICE";
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceTitle, pageWidth / 2, y + 7, { align: "center" });

  y += titleBoxHeight + 5;

  // ===== INVOICE DETAILS BOX: Right-aligned bordered table =====
  const detailsBoxWidth = 60;
  const detailsBoxX = pageWidth - margin - detailsBoxWidth;
  const detailsRowH = 7;

  doc.setLineWidth(0.3);
  doc.setDrawColor(100, 100, 100);

  // PI No row
  doc.rect(detailsBoxX, y, detailsBoxWidth, detailsRowH);
  doc.line(detailsBoxX + 25, y, detailsBoxX + 25, y + detailsRowH);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(245, 245, 245);
  doc.rect(detailsBoxX, y, 25, detailsRowH, "F");
  doc.rect(detailsBoxX, y, detailsBoxWidth, detailsRowH);
  doc.line(detailsBoxX + 25, y, detailsBoxX + 25, y + detailsRowH);
  doc.text("PI No.", detailsBoxX + 3, y + 5);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoiceNumber, detailsBoxX + 28, y + 5);

  // Date row
  const dateRowY = y + detailsRowH;
  doc.setFillColor(245, 245, 245);
  doc.rect(detailsBoxX, dateRowY, 25, detailsRowH, "F");
  doc.rect(detailsBoxX, dateRowY, detailsBoxWidth, detailsRowH);
  doc.line(detailsBoxX + 25, dateRowY, detailsBoxX + 25, dateRowY + detailsRowH);
  doc.setFont("helvetica", "bold");
  doc.text("Date", detailsBoxX + 3, dateRowY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.invoiceDate), detailsBoxX + 28, dateRowY + 5);

  y += detailsRowH * 2 + 5;

  // ===== CUSTOMER BOXES: Two bordered boxes side by side =====
  const halfWidth = contentWidth / 2;
  const custBoxHeight = 28;

  y = checkPageBreak(doc, y, custBoxHeight + 5);

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);

  // Invoice To box
  doc.rect(margin, y, halfWidth, custBoxHeight);
  // Delivered To box
  doc.rect(margin + halfWidth, y, halfWidth, custBoxHeight);

  // Invoice To header
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice To", margin + 3, y + 5);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin + 3, y + 6.5, margin + halfWidth - 3, y + 6.5);

  // Invoice To content
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.customer.name, margin + 3, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let custY = y + 15;
  if (invoice.customer.address) {
    const addrLines = doc.splitTextToSize(invoice.customer.address, halfWidth - 8);
    doc.text(addrLines, margin + 3, custY);
    custY += addrLines.length * 3.5;
  }
  if (invoice.customer.taxNumber) {
    doc.text(`VAT No: ${invoice.customer.taxNumber}`, margin + 3, custY);
  }

  // Delivered To header
  doc.setDrawColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Delivered To", margin + halfWidth + 3, y + 5);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin + halfWidth + 3, y + 6.5, margin + contentWidth - 3, y + 6.5);

  // Delivered To content
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.customer.name, margin + halfWidth + 3, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let delY = y + 15;
  const deliveryAddr = invoice.deliveryAddress || invoice.customer.address || "";
  if (deliveryAddr) {
    const delLines = doc.splitTextToSize(deliveryAddr, halfWidth - 8);
    doc.text(delLines, margin + halfWidth + 3, delY);
    delY += delLines.length * 3.5;
  }
  if (invoice.customer.taxNumber) {
    doc.text(`VAT No: ${invoice.customer.taxNumber}`, margin + halfWidth + 3, delY);
  }

  y += custBoxHeight + 4;

  // ===== ADDITIONAL DETAILS ROW =====
  y = checkPageBreak(doc, y, 16);

  const detailCols = 6;
  const cellWidth = contentWidth / detailCols;
  const headerRowH = 6;
  const dataRowH = 6;

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);

  const detailLabels = ["P.O. No.", "PO Date", "Term", "Delivery Date", "GRN No.", "PI No."];
  const detailValues = [
    invoice.poNumber || "-",
    formatDate(invoice.poDate) || "-",
    invoice.paymentTerms || "-",
    formatDate(invoice.deliveryDate) || "-",
    invoice.grnNumber || "-",
    invoice.referenceNumber || invoice.invoiceNumber,
  ];

  // Header row with background
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentWidth, headerRowH, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  for (let i = 0; i < detailCols; i++) {
    const cellX = margin + i * cellWidth;
    if (i > 0) doc.line(cellX, y, cellX, y + headerRowH + dataRowH);
    doc.text(detailLabels[i], cellX + 2, y + 4);
  }

  // Data row
  const dataY = y + headerRowH;
  doc.rect(margin, dataY, contentWidth, dataRowH);
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < detailCols; i++) {
    const cellX = margin + i * cellWidth;
    doc.text(detailValues[i], cellX + 2, dataY + 4);
  }

  y += headerRowH + dataRowH + 4;

  // ===== ITEM TABLE =====
  y = checkPageBreak(doc, y, 20);

  const colWidths = [contentWidth * 0.45, contentWidth * 0.12, contentWidth * 0.20, contentWidth * 0.23];
  const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
  const tableHeaderH = 8;

  // Table header with dark background
  doc.setFillColor(40, 40, 40);
  doc.rect(margin, y, contentWidth, tableHeaderH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Description", colX[0] + 3, y + 5.5);
  doc.text("Units", colX[1] + colWidths[1] / 2, y + 5.5, { align: "center" });
  doc.text("Rate", colX[2] + colWidths[2] - 3, y + 5.5, { align: "right" });
  doc.text("Amount", colX[3] + colWidths[3] - 3, y + 5.5, { align: "right" });

  // Draw header borders
  doc.setDrawColor(60, 60, 60);
  doc.rect(margin, y, contentWidth, tableHeaderH);
  for (let i = 1; i < 4; i++) {
    doc.line(colX[i], y, colX[i], y + tableHeaderH);
  }

  y += tableHeaderH;
  doc.setTextColor(0, 0, 0);

  // Group items by type
  const groups = groupItemsByType(invoice.items);
  const rowH = 6;

  for (const group of groups) {
    // Section header row
    y = checkPageBreak(doc, y, rowH + rowH * group.items.length);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, rowH, "FD");
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, rowH);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(group.label, margin + 3, y + 4.2);
    y += rowH;

    // Item rows
    for (const item of group.items) {
      y = checkPageBreak(doc, y, rowH);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowH);
      for (let i = 1; i < 4; i++) {
        doc.line(colX[i], y, colX[i], y + rowH);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);

      // Description - truncate if too long
      const maxDescWidth = colWidths[0] - 6;
      let desc = item.description;
      while (doc.getTextWidth(desc) > maxDescWidth && desc.length > 0) {
        desc = desc.substring(0, desc.length - 1);
      }
      if (desc.length < item.description.length) desc += "...";
      doc.text(desc, colX[0] + 3, y + 4.2);

      // Units (centered)
      doc.text(String(item.quantity), colX[1] + colWidths[1] / 2, y + 4.2, { align: "center" });

      // Rate (right-aligned)
      doc.text(
        item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        colX[2] + colWidths[2] - 3,
        y + 4.2,
        { align: "right" }
      );

      // Amount (right-aligned)
      doc.text(
        item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        colX[3] + colWidths[3] - 3,
        y + 4.2,
        { align: "right" }
      );

      y += rowH;
    }
  }

  // Empty rows for spacing if few items
  const minRows = 5;
  const totalItemRows = invoice.items.length + groups.length;
  if (totalItemRows < minRows) {
    for (let i = 0; i < minRows - totalItemRows; i++) {
      y = checkPageBreak(doc, y, rowH);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowH);
      for (let j = 1; j < 4; j++) {
        doc.line(colX[j], y, colX[j], y + rowH);
      }
      y += rowH;
    }
  }

  y += 5;

  // ===== TOTALS BOX: Right-aligned bordered table =====
  y = checkPageBreak(doc, y, 35);

  const totalsBoxWidth = 70;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const totalsLabelW = 35;
  const totalsRowH = 7;

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.setFontSize(8);

  let totalsY = y;

  // Sub Total row
  doc.rect(totalsBoxX, totalsY, totalsBoxWidth, totalsRowH);
  doc.line(totalsBoxX + totalsLabelW, totalsY, totalsBoxX + totalsLabelW, totalsY + totalsRowH);
  doc.setFont("helvetica", "bold");
  doc.text("Sub Total", totalsBoxX + 3, totalsY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(fmtCurrency(invoice.subtotal), totalsBoxX + totalsBoxWidth - 3, totalsY + 5, { align: "right" });
  totalsY += totalsRowH;

  // Discount row (if applicable)
  if (invoice.discountPercent > 0) {
    doc.rect(totalsBoxX, totalsY, totalsBoxWidth, totalsRowH);
    doc.line(totalsBoxX + totalsLabelW, totalsY, totalsBoxX + totalsLabelW, totalsY + totalsRowH);
    doc.setFont("helvetica", "bold");
    doc.text(`Discount (${invoice.discountPercent}%)`, totalsBoxX + 3, totalsY + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 0, 0);
    doc.text(`- ${fmtCurrency(invoice.discountAmount)}`, totalsBoxX + totalsBoxWidth - 3, totalsY + 5, { align: "right" });
    doc.setTextColor(0, 0, 0);
    totalsY += totalsRowH;
  }

  // SSCL row
  if (invoice.ssclPercent > 0) {
    doc.rect(totalsBoxX, totalsY, totalsBoxWidth, totalsRowH);
    doc.line(totalsBoxX + totalsLabelW, totalsY, totalsBoxX + totalsLabelW, totalsY + totalsRowH);
    doc.setFont("helvetica", "bold");
    doc.text(`SSCL ${invoice.ssclPercent}%`, totalsBoxX + 3, totalsY + 5);
    doc.setFont("helvetica", "normal");
    doc.text(fmtCurrency(invoice.ssclAmount), totalsBoxX + totalsBoxWidth - 3, totalsY + 5, { align: "right" });
    totalsY += totalsRowH;
  }

  // VAT row
  if (invoice.taxPercent > 0) {
    doc.rect(totalsBoxX, totalsY, totalsBoxWidth, totalsRowH);
    doc.line(totalsBoxX + totalsLabelW, totalsY, totalsBoxX + totalsLabelW, totalsY + totalsRowH);
    doc.setFont("helvetica", "bold");
    doc.text(`VAT (${invoice.taxPercent}%)`, totalsBoxX + 3, totalsY + 5);
    doc.setFont("helvetica", "normal");
    doc.text(fmtCurrency(invoice.taxAmount), totalsBoxX + totalsBoxWidth - 3, totalsY + 5, { align: "right" });
    totalsY += totalsRowH;
  }

  // Grand Total row (with background)
  doc.setFillColor(240, 240, 240);
  doc.rect(totalsBoxX, totalsY, totalsBoxWidth, totalsRowH + 1, "FD");
  doc.line(totalsBoxX + totalsLabelW, totalsY, totalsBoxX + totalsLabelW, totalsY + totalsRowH + 1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Grand Total", totalsBoxX + 3, totalsY + 5.5);
  doc.text(fmtCurrency(invoice.grandTotal), totalsBoxX + totalsBoxWidth - 3, totalsY + 5.5, { align: "right" });
  totalsY += totalsRowH + 1;

  y = totalsY + 8;

  // ===== NOTES =====
  if (invoice.notes) {
    y = checkPageBreak(doc, y, 15);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 3.5 + 3;
  }

  // ===== TERMS & CONDITIONS =====
  if (invoice.termsAndConditions) {
    y = checkPageBreak(doc, y, 15);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const termLines = doc.splitTextToSize(invoice.termsAndConditions, contentWidth);
    doc.text(termLines, margin, y);
    y += termLines.length * 3.5 + 3;
  }

  // ===== SIGNATURE SECTION =====
  y = checkPageBreak(doc, y, 30);
  y += 10;

  const sigWidth = (contentWidth - 20) / 3;
  const sigLabels = ["Prepared By", "Checked By", "Approved By"];
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.3);

  for (let i = 0; i < 3; i++) {
    const x = margin + i * (sigWidth + 10);
    doc.line(x, y + 16, x + sigWidth, y + 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(sigLabels[i], x + sigWidth / 2, y + 20, { align: "center" });
  }

  // ===== FOOTER: Contact bar at page bottom =====
  if (company) {
    const footerY = 285;
    const footerH = 8;

    doc.setFillColor(40, 40, 40);
    doc.rect(0, footerY, pageWidth, footerH, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");

    const footerParts: string[] = [];
    if (company.phone) footerParts.push(`Tel: ${company.phone}`);
    if (company.faxNumber) footerParts.push(`Fax: ${company.faxNumber}`);
    if (company.website) footerParts.push(company.website);
    if (company.email) footerParts.push(company.email);
    if (company.address) footerParts.push(company.address.replace(/\n/g, ", "));

    const footerText = footerParts.join("  |  ");
    doc.text(footerText, pageWidth / 2, footerY + 5.5, { align: "center" });

    doc.setTextColor(0, 0, 0);
  }

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
