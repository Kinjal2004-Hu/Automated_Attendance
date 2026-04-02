import { ReactNode } from "react";
import { Sidebar } from "../navigation/sidebar";
import { ModeToggle } from "../mode-toggle";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Automated Attendance System
              </h1>
            </div>
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
