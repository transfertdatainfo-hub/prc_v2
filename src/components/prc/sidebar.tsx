import Link from "next/link";
import { cn } from "@/lib/utils";
import { LineChart, Newspaper, BarChart3, User } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LineChart },
  { label: "Actualités", href: "/news", icon: Newspaper },
  { label: "Indices", href: "/indices", icon: BarChart3 },
  { label: "Profil", href: "/profil", icon: User },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-prc-surface border-r border-prc-primary/10 p-4">
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-prc-text hover:bg-prc-primary/10",
            )}
          >
            <item.icon className="w-5 h-5 text-prc-primary" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
