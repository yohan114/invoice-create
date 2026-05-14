import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell user={{ name: user.name, role: user.role }}>
      {children}
    </DashboardShell>
  );
}
