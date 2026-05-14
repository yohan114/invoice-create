"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Cog,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userRole?: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "TECHNICIAN", "CASHIER"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "MANAGER"] },
  { href: "/jobs", label: "Jobs", icon: Wrench, roles: ["ADMIN", "MANAGER", "TECHNICIAN"] },
  { href: "/equipment", label: "Equipment", icon: Cog, roles: ["ADMIN", "MANAGER", "TECHNICIAN"] },
  { href: "/invoices", label: "Invoices", icon: FileText, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/inventory", label: "Inventory", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { href: "/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export default function Sidebar({ open, onClose, userRole = "ADMIN" }: SidebarProps) {
  const pathname = usePathname();
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Workshop Pro</h1>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
