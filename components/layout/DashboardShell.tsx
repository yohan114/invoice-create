"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardShellProps {
  children: ReactNode;
  user: { name: string; role: string };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
