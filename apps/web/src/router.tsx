import { createBrowserRouter } from "react-router";

import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/protected-route";
import Home from "./routes/home";
import Login from "./routes/login";
import { EnrollmentPage } from "./routes/enroll";
import { FacultyDashboard } from "./routes/faculty-dashboard";
import { AttendanceRecordsPage } from "./routes/attendance-records";
import AnalyticsPage from "./routes/analytics";
import Dashboard from "./routes/dashboard";

function NotFound() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-muted-foreground">The requested page could not be found.</p>
    </main>
  );
}

export const router = createBrowserRouter([
  // Auth Routes
  {
    path: "/login",
    element: <Login />,
  },
  // Protected Routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Home />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/enroll",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <EnrollmentPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/faculty/dashboard",
    element: (
      <ProtectedRoute requiredRole="faculty">
        <AppLayout>
          <FacultyDashboard />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance/records",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <AttendanceRecordsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance/edit/:classId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold">Edit Attendance</h1>
            <p className="text-slate-500 mt-2">Edit attendance records coming soon</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/faculty/analytics",
    element: (
      <ProtectedRoute requiredRole="faculty">
        <AppLayout>
          <AnalyticsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AppLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-slate-500 mt-2">User management page coming soon</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AppLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-500 mt-2">Admin dashboard coming soon</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
