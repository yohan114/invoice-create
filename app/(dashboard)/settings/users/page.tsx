import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getUsers } from "@/lib/actions/users";
import UserManagement from "./UserManagement";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
      <UserManagement users={users} />
    </div>
  );
}
