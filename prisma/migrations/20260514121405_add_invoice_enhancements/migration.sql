-- AlterTable
ALTER TABLE "CompanySettings" ADD COLUMN "companySubtitle" TEXT;
ALTER TABLE "CompanySettings" ADD COLUMN "faxNumber" TEXT;
ALTER TABLE "CompanySettings" ADD COLUMN "footerDetails" TEXT;
ALTER TABLE "CompanySettings" ADD COLUMN "website" TEXT;

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelNumber" TEXT,
    "serialNumber" TEXT,
    "registrationNumber" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT,
    "invoiceType" TEXT NOT NULL DEFAULT 'PROFORMA',
    "subtotal" REAL NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "taxPercent" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "ssclPercent" REAL NOT NULL DEFAULT 0,
    "ssclAmount" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "poNumber" TEXT,
    "poDate" DATETIME,
    "deliveryDate" DATETIME,
    "grnNumber" TEXT,
    "paymentTerms" TEXT,
    "referenceNumber" TEXT,
    "deliveryAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("createdAt", "customerId", "discountAmount", "discountPercent", "dueDate", "grandTotal", "id", "invoiceDate", "invoiceNumber", "jobId", "notes", "status", "subtotal", "taxAmount", "taxPercent", "termsAndConditions", "updatedAt") SELECT "createdAt", "customerId", "discountAmount", "discountPercent", "dueDate", "grandTotal", "id", "invoiceDate", "invoiceNumber", "jobId", "notes", "status", "subtotal", "taxAmount", "taxPercent", "termsAndConditions", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "technicianId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completionDate" DATETIME,
    "notes" TEXT,
    "equipmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("completionDate", "createdAt", "customerId", "date", "id", "itemDescription", "jobNumber", "notes", "problemDescription", "status", "technicianId", "updatedAt") SELECT "completionDate", "createdAt", "customerId", "date", "id", "itemDescription", "jobNumber", "notes", "problemDescription", "status", "technicianId", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
