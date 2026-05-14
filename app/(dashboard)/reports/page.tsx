import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import {
  BarChart3,
  Clock,
  Users,
  Wrench,
  Package,
  TrendingUp,
} from "lucide-react";

const reportCards = [
  {
    title: "Sales Report",
    description: "Revenue analysis with daily, weekly, monthly, and yearly breakdowns",
    icon: BarChart3,
    href: "/reports/sales",
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Pending Payments",
    description: "Outstanding invoices, overdue amounts, and aging analysis",
    icon: Clock,
    href: "/reports/payments",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    title: "Customer History",
    description: "Invoice history and totals per customer",
    icon: Users,
    href: "/reports/customers",
    color: "text-green-600 bg-green-50",
  },
  {
    title: "Job History",
    description: "Jobs grouped by status with counts and date filters",
    icon: Wrench,
    href: "/reports/jobs",
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "Inventory Usage",
    description: "Parts consumed in invoices, most used parts, and stock value",
    icon: Package,
    href: "/reports/inventory",
    color: "text-orange-600 bg-orange-50",
  },
  {
    title: "Profit Report",
    description: "Income vs costs analysis with net profit calculation",
    icon: TrendingUp,
    href: "/reports/profit",
    color: "text-emerald-600 bg-emerald-50",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`rounded-lg p-3 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
