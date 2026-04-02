import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Calendar, Users, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session && !isPending) {
      navigate("/login");
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (session?.user.role === "faculty") {
    return <FacultyDashboard session={session} />;
  } else if (session?.user.role === "admin") {
    return <AdminDashboard session={session} />;
  }

  return <StudentDashboard session={session} />;
}

function StudentDashboard({ session }: { session: any }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your attendance and enrollment status
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Attendance Rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">--</p>
            </div>
            <BarChart3 size={32} className="text-indigo-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Classes Attended</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">--</p>
            </div>
            <CheckCircle2 size={32} className="text-green-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Classes Missed</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">--</p>
            </div>
            <Calendar size={32} className="text-orange-600/20" />
          </div>
        </Card>
      </section>

      {/* Enrollment Status */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Enrollment Status</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Status</label>
              <p className="text-lg font-semibold text-green-600 mt-1">✓ Enrolled</p>
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Enrollment Date</label>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/attendance/records")}
            >
              View Attendance Records
            </Button>
          </div>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Recent Classes</h2>
        <Card className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No recent attendance records
          </p>
        </Card>
      </section>
    </div>
  );
}

function FacultyDashboard({ session }: { session: any }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your classes and track attendance
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Classes</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Calendar size={32} className="text-blue-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Users size={32} className="text-indigo-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Attendance</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">--%</p>
            </div>
            <BarChart3 size={32} className="text-green-600/20" />
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            className="h-12"
            onClick={() => navigate("/faculty/dashboard")}
          >
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => navigate("/attendance/edit/new")}
          >
            Edit Records
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => navigate("/faculty/analytics")}
          >
            View Analytics
          </Button>
        </div>
      </section>

      {/* Today's Classes */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Today's Classes</h2>
        <Card className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No classes scheduled for today
          </p>
        </Card>
      </section>
    </div>
  );
}

function AdminDashboard({ session }: { session: any }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          System overview and user management
        </p>
      </section>

      {/* System Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Users size={32} className="text-blue-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Students</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Users size={32} className="text-green-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Faculty</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Users size={32} className="text-indigo-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Classes</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <Calendar size={32} className="text-orange-600/20" />
          </div>
        </Card>
      </section>

      {/* Admin Actions */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            className="h-12"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => navigate("/faculty/analytics")}
          >
            System Analytics
          </Button>
        </div>
      </section>

      {/* User Management */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">User Management</h2>
        <Card className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No users to display
          </p>
        </Card>
      </section>
    </div>
  );
}
