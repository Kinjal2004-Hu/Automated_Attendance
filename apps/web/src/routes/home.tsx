import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { env } from "@Automated_Attendance/env/web";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";

type HealthResponse = {
  server: string;
  mlService: string;
  enrolledStudents: number;
};

async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${env.VITE_SERVER_URL}/api/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch health");
  }
  return response.json() as Promise<HealthResponse>;
}

export default function Home() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Request failed"));
  }, []);

  const studentFeatures = [
    {
      icon: Camera,
      title: "Enrollment",
      description: "Enroll by uploading your face photos",
      action: "Enroll Now",
      href: "/enroll",
    },
    {
      icon: Clock,
      title: "Attendance",
      description: "Track your attendance across classes",
      action: "View Records",
      href: "/attendance/records",
    },
    {
      icon: BarChart3,
      title: "Statistics",
      description: "View your attendance statistics",
      action: "View Stats",
      href: "/attendance/records",
    },
  ];

  const facultyFeatures = [
    {
      icon: Camera,
      title: "Mark Attendance",
      description: "Process class photos to mark attendance",
      action: "Mark Now",
      href: "/faculty/dashboard",
    },
    {
      icon: CheckCircle2,
      title: "Edit Records",
      description: "Edit and manage attendance records",
      action: "Edit",
      href: "/attendance/edit/new",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View detailed attendance analytics",
      action: "View Analytics",
      href: "/faculty/analytics",
    },
  ];

  const features = session?.user.role === "faculty" ? facultyFeatures : studentFeatures;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="py-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Automated Attendance System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
            Facial recognition-powered attendance tracking for educational institutions
          </p>

          {session && (
            <div className="flex items-center gap-2 text-sm">
              <User size={18} />
              <span className="text-slate-600 dark:text-slate-400">
                Logged in as {session.user.name} ({session.user.role})
              </span>
            </div>
          )}
        </div>
      </section>

      {/* System Status */}
      {health && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 border border-blue-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Server</p>
              <p className="text-lg font-semibold text-green-600">✓ {health.server}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Service</p>
              <p className={`text-lg font-semibold ${health.mlService === "ok" ? "text-green-600" : "text-red-600"}`}>
                {health.mlService === "ok" ? "✓" : "✗"} {health.mlService}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enrolled Students</p>
              <p className="text-lg font-semibold text-indigo-600">{health.enrolledStudents}</p>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Features Section */}
      <section className="py-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {session?.user.role === "faculty" ? "Faculty Features" : "Student Features"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Icon size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {feature.description}
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate(feature.href)}
                >
                  {feature.action}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Quick Start Guide
        </h2>
        <div className="space-y-4">
          {session?.user.role === "student" ? (
            <>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Enroll Your Face</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upload clear face photos from different angles to register in the system
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Attend Classes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Faculty will capture attendance using facial recognition technology
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">View Statistics</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your attendance records and view your statistics
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Create Class</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set up a new class session with course details
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Capture Photo</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Take a class photo to automatically detect and recognize students
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Review & Export</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Edit records if needed and export attendance data
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
