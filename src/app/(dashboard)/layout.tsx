import { Sidebar } from "@/components/prc/sidebar";
import { Topbar } from "@/components/prc/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-prc-background text-prc-text">
      {/* Topbar en premier, sur toute la largeur */}
      <Topbar />

      {/* Ensuite le reste (sidebar + contenu) */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
