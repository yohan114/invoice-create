# Workshop Invoice Management System

A complete billing and proforma invoice management system for maintenance and service workshops. Manage customers, jobs, equipment, inventory, and generate professional invoices with PDF export.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16 (React 19)** | Frontend and Backend |
| **Tailwind CSS v4** | Styling |
| **Prisma ORM** | Database management |
| **SQLite** | Database (no external server needed) |
| **TypeScript** | Type safety |
| **jsPDF** | PDF generation |
| **Recharts** | Dashboard charts |
| **JWT** | Authentication |

---

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

- **Node.js** version 18 or higher (we recommend v22)
  Download it from [https://nodejs.org](https://nodejs.org)
- **npm** (comes bundled with Node.js - no separate install needed)
- **Git** (to clone the repository)
  Download it from [https://git-scm.com](https://git-scm.com)

### Verify your installation

Open a terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
node --version
```

You should see something like `v22.x.x`. Any version `v18.0.0` or higher will work.

```bash
npm --version
```

You should see a version number like `10.x.x`. Any recent version is fine.

---

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yohan114/invoice-create.git
cd invoice-create
```

This downloads the project code to your computer and moves into the project folder.

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all the packages the project needs. It may take 1-2 minutes depending on your internet speed. You will see a `node_modules` folder appear when it finishes.

### Step 3: Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

- The first command generates the database client that the application uses to talk to the database.
- The second command creates the SQLite database file.

No need to install a separate database server - SQLite stores everything in a single file (`prisma/dev.db`).

### Step 4: Seed the Database (Add Sample Data)

```bash
npx prisma db seed
```

This creates the default admin user and sample company settings so you can log in immediately.

### Step 5: Start the Development Server

```bash
npm run dev
```

The server starts on [http://localhost:3000](http://localhost:3000). Open this URL in your browser.

### Step 6: Log In

Once the page loads, use these credentials:

- **URL:** http://localhost:3000
- **Email:** `admin@workshop.com`
- **Password:** `admin123`

You will be taken to the dashboard where you can start managing invoices, customers, and more.

---

## Quick Start (Copy-Paste)

For experienced developers who want to get running fast - all commands in one block:

```bash
git clone https://github.com/yohan114/invoice-create.git
cd invoice-create
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

---

## Environment Variables

The `.env` file is already included with default development values. You do not need to create one manually.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Path to SQLite database file | `file:./dev.db` |
| `JWT_SECRET` | Secret key for authentication tokens | Pre-set for development |

> **Important:** Change `JWT_SECRET` to a strong random string before deploying to production.

---

## Features

- Dashboard with sales overview and charts
- Customer Management (CRUD)
- Equipment/Vehicle Management
- Job/Service Management with status tracking
- Professional Invoice Creation (Proforma and Tax Invoice)
- Parts and Inventory with stock tracking
- Payment Recording (full/partial)
- Reports (sales, payments, inventory, profit)
- User Role Management (Admin, Manager, Technician, Cashier)
- PDF Export and Print
- Company Settings and Branding

---

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full access to all modules including user management |
| **Manager** | Access to all modules except user management |
| **Technician** | Access to jobs, equipment, and view invoices |
| **Cashier** | Access to invoices, payments, and customers |

---

## Project Structure

```
invoice-create/
├── app/              # Next.js App Router pages
│   ├── (dashboard)/  # Protected dashboard pages
│   ├── invoices/     # Invoice management & print
│   └── login/        # Login page
├── components/       # Reusable UI components
├── lib/              # Utilities, server actions, database client
├── prisma/           # Database schema and seed data
└── public/           # Static assets
```

---

## Common Issues / Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Module not found" error** | Run `npm install` again |
| **"prisma: command not found"** | Run `npx prisma generate` |
| **Database errors** | Delete `prisma/dev.db` and run `npx prisma db push` then `npx prisma db seed` again |
| **Port 3000 already in use** | Run `npm run dev -- -p 3001` to use a different port |
| **"Cannot find module @prisma/client"** | Run `npx prisma generate` |

---

## Production Build

To create an optimized production build:

```bash
npm run build
npm start
```

> **Note:** Change `JWT_SECRET` in `.env` to a strong random string before deploying to production.

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run code linter |
| `npx prisma studio` | Open database GUI in browser |
| `npx prisma db push` | Sync schema to database |
| `npx prisma db seed` | Seed database with sample data |

---

## License

MIT
