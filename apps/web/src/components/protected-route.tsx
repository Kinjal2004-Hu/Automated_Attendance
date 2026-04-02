import { ReactNode } from "react";
import { Navigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Loader } from "./loader";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "student" | "faculty" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
