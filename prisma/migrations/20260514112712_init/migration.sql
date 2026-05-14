-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TECHNICIAN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "costPrice" REAL NOT NULL,
    "supplier" TEXT,
    "reorderLevel" INTEGER NOT NULL DEFAULT 5,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "customerId" TEXT NOT NULL,
    "jobId" TEXT,
    "subtotal" REAL NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "taxPercent" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "partId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "taxNumber" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "currency" TEXT NOT NULL DEFAULT 'Rs.',
    "termsAndConditions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
