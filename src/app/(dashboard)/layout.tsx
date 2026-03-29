import { Sidebar } from "@/components/layout/sidebar";
import { CommandBar } from "@/components/layout/command-bar";
import { DashboardGuard } from "@/components/auth/dashboard-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <aside className="hidden lg:block h-full shrink-0">
          <Sidebar />
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <CommandBar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
