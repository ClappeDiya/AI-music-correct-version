"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Settings,
  BarChart,
  Shield,
  Bell,
  FileText,
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/admin_tools",
    icon: BarChart,
  },
  {
    title: "User Management",
    href: "/admin_tools/users",
    icon: Users,
  },
  {
    title: "Security",
    href: "/admin_tools/security",
    icon: Shield,
  },
  {
    title: "Reports",
    href: "/admin_tools/reports",
    icon: FileText,
  },
  {
    title: "Notifications",
    href: "/admin_tools/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/admin_tools/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "transparent",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
