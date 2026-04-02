import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Activity, BarChart3, Settings, ArrowRight } from "lucide-react";

interface SystemStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function AdminDashboard() {
  // Mock system stats
  const stats: SystemStat[] = [
    {
      title: "Total Users",
      value: 287,
      icon: <Users size={24} />,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Active Students",
      value: 234,
      icon: <BookOpen size={24} />,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Faculty Members",
      value: 45,
      icon: <Users size={24} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Attendance Records",
      value: 12847,
      icon: <Activity size={24} />,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const recentActivity = [
    { user: "John Doe", action: "Marked attendance", time: "2 minutes ago" },
    { user: "Jane Smith", action: "Updated class settings", time: "15 minutes ago" },
    { user: "Bob Johnson", action: "Enrolled in CS101", time: "1 hour ago" },
    {
      user: "Alice Wilson",
      action: "Exported attendance report",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          System overview and management
        </p>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stat.value}
            </p>
          </Card>
        ))}
      </section>

      {/* Management Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                User Management
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage system users and roles
              </p>
            </div>
            <Settings size={24} className="text-slate-400" />
          </div>
          <div className="space-y-2 mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Add new users to the system
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Assign or change user roles
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Deactivate user accounts
            </p>
          </div>
          <Button className="w-full mt-6" onClick={() => window.location.href = "/admin/users"}>
            Manage Users
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Card>

        {/* Analytics */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                System Analytics
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                View detailed system statistics
              </p>
            </div>
            <BarChart3 size={24} className="text-slate-400" />
          </div>
          <div className="space-y-2 mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Attendance trends and statistics
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Class-wise performance reports
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              • Export system reports
            </p>
          </div>
          <Button className="w-full mt-6" onClick={() => window.location.href = "/faculty/analytics"}>
            View Analytics
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {activity.user}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {activity.action}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* System Health */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Server Status
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            All systems running normally
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Database Status
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Response time: 12ms
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            API Status
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Successfully serving requests
          </p>
        </Card>
      </section>
    </div>
  );
}

export default AdminDashboard;
