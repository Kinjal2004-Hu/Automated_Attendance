import { Outlet } from "react-router";
import { Link } from "react-router";

export default function AppShell() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Automated Attendance</h1>
        <nav className="mt-3 flex gap-4 text-sm">
          <Link className="underline" to="/">
            Home
          </Link>
          <Link className="underline" to="/enroll">
            Enroll Student
          </Link>
          <Link className="underline" to="/faculty-dashboard">
            Mark Attendance
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
