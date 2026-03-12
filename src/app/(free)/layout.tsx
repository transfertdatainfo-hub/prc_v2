import { FreeHeader } from "@/components/prc/free-header";

export default function FreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-prc-background text-prc-text">
      <FreeHeader />
      <main className="flex-1 p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
