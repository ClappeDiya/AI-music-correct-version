"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Calendar,
  LineChart,
  Users,
  FileTemplate,
  History,
  Braces,
  Key,
  Coins,
  Brain,
  Box,
  Dna,
  Network,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface SidebarItem {
  icon: typeof FileText;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: TrendingUp, label: "KPI Definitions", href: "/reports/kpis" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: LineChart, label: "Report Results", href: "/reports/results" },
  { icon: Calendar, label: "Report Schedules", href: "/reports/schedules" },
  { icon: LineChart, label: "Forecasted Metrics", href: "/reports/forecasts" },
  { icon: Users, label: "Persona Segments", href: "/reports/personas" },
  {
    icon: FileTemplate,
    label: "Query Templates",
    href: "/reports/query-templates",
  },
  {
    icon: History,
    label: "KPI Version History",
    href: "/reports/kpi-history",
  },
  {
    icon: Braces,
    label: "Multi-Modal Interactions",
    href: "/reports/interactions",
  },
  {
    icon: Key,
    label: "Quantum Licensing",
    href: "/reports/quantum-licensing",
  },
  {
    icon: Coins,
    label: "Blockchain Royalties",
    href: "/reports/blockchain",
  },
  {
    icon: Brain,
    label: "Neurofeedback Config",
    href: "/reports/neurofeedback",
  },
  {
    icon: Box,
    label: "Holographic Settings",
    href: "/reports/holographic",
  },
  { icon: Dna, label: "Bio-Inspired Reco", href: "/reports/bio-inspired" },
  {
    icon: Network,
    label: "Compute Config",
    href: "/reports/compute-config",
  },
];

interface ReportsLayoutProps {
  children: ReactNode;
}

export function ReportsLayout({ children }: ReportsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background md:hidden">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10",
                    pathname === item.href && "bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{item.label}</TooltipContent>
            </Tooltip>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
    </div>
  );
}
