import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit2, Shield, Loader } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "faculty",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "student",
    createdAt: "2024-02-20",
  },
  {
    id: "5",
    name: "Alice Wilson",
    email: "alice@example.com",
    role: "faculty",
    createdAt: "2024-02-15",
  },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"student" | "faculty" | "admin">("student");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangeRole = (userId: string, role: "student" | "faculty" | "admin") => {
    setLoading(true);
    setTimeout(() => {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      setEditingId(null);
      toast.success(`User role updated to ${role}`);
      setLoading(false);
    }, 500);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setLoading(true);
      setTimeout(() => {
        setUsers(users.filter((u) => u.id !== userId));
        toast.success("User deleted successfully");
        setLoading(false);
      }, 500);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      case "faculty":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "student":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage system users and their roles
        </p>
      </section>

      {/* Search */}
      <section>
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Users Table */}
      <section>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <p className="text-slate-500 dark:text-slate-400">
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === user.id ? (
                          <div className="flex gap-2">
                            <select
                              value={newRole}
                              onChange={(e) =>
                                setNewRole(
                                  e.target.value as "student" | "faculty" | "admin"
                                )
                              }
                              className="text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleChangeRole(user.id, newRole)}
                              disabled={loading}
                            >
                              {loading ? "..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(user.id);
                              setNewRole(user.role);
                            }}
                            disabled={loading || editingId !== null}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {users.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Students</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {users.filter((u) => u.role === "student").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Faculty</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {users.filter((u) => u.role === "faculty").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </Card>
      </section>
    </div>
  );
}

export default AdminUsersPage;
