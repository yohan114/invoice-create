"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, deleteUser } from "@/lib/actions/users";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
}

interface UserManagementProps {
  users: User[];
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "ADMIN":
      return "danger";
    case "MANAGER":
      return "warning";
    case "TECHNICIAN":
      return "info";
    case "CASHIER":
      return "success";
    default:
      return "default";
  }
}

export default function UserManagement({ users }: UserManagementProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Add user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("TECHNICIAN");

  // Edit user form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
    });

    if (result.success) {
      setShowAddForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("TECHNICIAN");
      router.refresh();
    } else {
      setErrors(result.errors || {});
    }
    setLoading(false);
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditActive(user.active);
    setErrors({});
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setErrors({});

    const result = await updateUser(editingId, {
      name: editName,
      email: editEmail,
      role: editRole,
      active: editActive,
    });

    if (result.success) {
      setEditingId(null);
      router.refresh();
    } else {
      setErrors(result.errors || {});
    }
    setLoading(false);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    await deleteUser(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                    minLength={6}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="CASHIER">Cashier</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={loading}>Create User</Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="TECHNICIAN">Technician</option>
                          <option value="CASHIER">Cashier</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(e) => setEditActive(e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={handleUpdate} loading={loading}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? "success" : "default"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(user)}>Edit</Button>
                          {user.active && (
                            <Button size="sm" variant="danger" onClick={() => handleDeactivate(user.id)}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
