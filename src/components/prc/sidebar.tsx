// src/components/prc/sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  BarChart3,
  Wallet,
  CheckCircle,
} from "lucide-react";

const items = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Actualités", href: "/news", icon: Newspaper },
  { label: "Portefeuilles", href: "/portefeuilles", icon: Wallet },
  { label: "Marchés & Indices", href: "/indices", icon: BarChart3 },
  { label: "Stratégie", href: "/strategy", icon: BarChart3 },
  { label: "Gestion des tâches", href: "/backlogs", icon: CheckCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-400",
                )}
              />
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
