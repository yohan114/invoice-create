import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@workshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@workshop.com",
      password: hashedPassword,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Created admin user:", admin.email);

  // Create company settings
  const company = await prisma.companySettings.create({
    data: {
      companyName: "Workshop Pro",
      address: "123 Main Street, City",
      phone: "+94 11 234 5678",
      email: "info@workshoppro.com",
      website: "https://www.workshoppro.com",
      faxNumber: "+94 11 234 5679",
      companySubtitle: "Authorized Service & Repair Center",
      invoicePrefix: "INV",
      currency: "Rs.",
      termsAndConditions:
        "Payment is due within 30 days. All repairs carry a 30-day warranty.",
    },
  });

  console.log("Created company settings:", company.companyName);

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "John Perera",
      phone: "+94 77 123 4567",
      email: "john.perera@email.com",
      address: "45 Galle Road, Colombo 03",
      taxNumber: "TAX-001234",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Samantha Silva",
      phone: "+94 71 987 6543",
      email: "samantha.silva@email.com",
      address: "78 Kandy Road, Kadawatha",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Mohamed Farooq",
      phone: "+94 76 555 1234",
      email: "m.farooq@email.com",
      address: "12 Temple Street, Kandy",
      taxNumber: "TAX-005678",
    },
  });

  console.log("Created 3 sample customers");

  // Create sample parts with various stock levels
  const parts = await Promise.all([
    prisma.part.create({
      data: {
        name: "LCD Screen 15.6 inch",
        description: "Replacement LCD screen for laptops",
        quantity: 12,
        unitPrice: 8500.0,
        costPrice: 6000.0,
        supplier: "Tech Parts Ltd",
        reorderLevel: 5,
        unit: "pcs",
      },
    }),
    prisma.part.create({
      data: {
        name: "Laptop Battery",
        description: "Universal laptop battery pack",
        quantity: 3,
        unitPrice: 4500.0,
        costPrice: 3000.0,
        supplier: "Power Solutions",
        reorderLevel: 5,
        unit: "pcs",
      },
    }),
    prisma.part.create({
      data: {
        name: "Keyboard Standard",
        description: "USB standard keyboard",
        quantity: 20,
        unitPrice: 1200.0,
        costPrice: 750.0,
        supplier: "Peripherals Inc",
        reorderLevel: 10,
        unit: "pcs",
      },
    }),
    prisma.part.create({
      data: {
        name: "Thermal Paste",
        description: "High-quality thermal compound",
        quantity: 2,
        unitPrice: 350.0,
        costPrice: 200.0,
        supplier: "Tech Parts Ltd",
        reorderLevel: 5,
        unit: "tubes",
      },
    }),
    prisma.part.create({
      data: {
        name: "SATA Cable",
        description: "SATA data cable for HDDs/SSDs",
        quantity: 15,
        unitPrice: 250.0,
        costPrice: 120.0,
        supplier: "Cable World",
        reorderLevel: 8,
        unit: "pcs",
      },
    }),
  ]);

  console.log("Created 5 sample parts");

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      jobNumber: "JOB-0001",
      date: new Date("2024-01-15"),
      customerId: customer1.id,
      itemDescription: "Dell Laptop Inspiron 15",
      problemDescription: "Screen flickering and battery not charging",
      technicianId: admin.id,
      status: "IN_PROGRESS",
      notes: "Ordered replacement screen",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      jobNumber: "JOB-0002",
      date: new Date("2024-01-18"),
      customerId: customer2.id,
      itemDescription: "HP Printer LaserJet Pro",
      problemDescription: "Paper jam and print quality issues",
      status: "PENDING",
      notes: "Customer will bring toner cartridge",
    },
  });

  console.log("Created 2 sample jobs");

  // Create sample equipment linked to customers
  const equipment1 = await prisma.equipment.create({
    data: {
      customerId: customer1.id,
      name: "Dell Laptop Inspiron 15",
      modelNumber: "Inspiron 15 5510",
      serialNumber: "DL-2024-78901",
      description: "15.6 inch laptop, Intel Core i5, 8GB RAM",
    },
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      customerId: customer1.id,
      name: "Canon Printer PIXMA",
      modelNumber: "PIXMA G3010",
      serialNumber: "CN-2023-45678",
      registrationNumber: "REG-PR-001",
      description: "Ink tank wireless printer",
    },
  });

  const equipment3 = await prisma.equipment.create({
    data: {
      customerId: customer2.id,
      name: "HP Printer LaserJet Pro",
      modelNumber: "LaserJet Pro M404dn",
      serialNumber: "HP-2024-11223",
      registrationNumber: "REG-PR-002",
      description: "Monochrome laser printer with duplex printing",
    },
  });

  const equipment4 = await prisma.equipment.create({
    data: {
      customerId: customer3.id,
      name: "Lenovo ThinkPad T480",
      modelNumber: "ThinkPad T480",
      serialNumber: "LN-2023-99887",
      description: "14 inch business laptop, Intel Core i7, 16GB RAM",
    },
  });

  console.log("Created 4 sample equipment entries");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
