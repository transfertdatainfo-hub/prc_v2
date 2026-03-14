import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Newspaper,
  BarChart3,
  User,
  Wallet,
  LogOut,
} from "lucide-react";

const items = [
  { label: "Tableau de bord", href: "/dashboard", icon: LineChart },
  { label: "Actualités", href: "/news", icon: Newspaper },
  { label: "Portefeuilles", href: "/portefeuilles", icon: Wallet },
  { label: "Marchés & Indices", href: "/indices", icon: BarChart3 },
  { label: "Stratégie", href: "/strategy", icon: BarChart3 },
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
