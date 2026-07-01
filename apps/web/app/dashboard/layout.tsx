import { getRequiredSession } from "@/lib/session";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getRequiredSession();

  return (
    <div className="flex min-h-screen bg-transparent">
      <DashboardNav user={session.user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
