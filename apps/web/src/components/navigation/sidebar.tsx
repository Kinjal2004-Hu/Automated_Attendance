import { Link, useLocation } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import {
  Home,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const menuItems =
    session?.user.role === "admin"
      ? [
          { label: "Dashboard", href: "/dashboard", icon: Home },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Analytics", href: "/faculty/analytics", icon: BarChart3 },
        ]
      : session?.user.role === "faculty"
        ? [
            { label: "Dashboard", href: "/dashboard", icon: Home },
            { label: "Mark Attendance", href: "/faculty/dashboard", icon: BookOpen },
            { label: "Edit Records", href: "/attendance/edit/new", icon: Settings },
            { label: "Analytics", href: "/faculty/analytics", icon: BarChart3 },
          ]
        : [
            { label: "Home", href: "/", icon: Home },
            { label: "My Dashboard", href: "/dashboard", icon: BookOpen },
            { label: "Enroll", href: "/enroll", icon: Settings },
          ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 z-30 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:w-auto md:flex md:flex-col`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated System
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon size={18} className="mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="mb-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
              Logged in as
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {session?.user.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {session?.user.role}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
