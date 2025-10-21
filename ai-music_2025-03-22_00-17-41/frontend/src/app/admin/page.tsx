"use client";

import { Card } from "@/components/ui/Card";
import { useAdminStats } from "@/services/AdminService";
import { Users, FileText, ShieldAlert, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();

  const statCards = [
    {
      title: "Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: "Total registered users",
      change: "+12%",
      href: "/admin/users",
    },
    {
      title: "Reports",
      value: stats?.reports ?? 0,
      icon: FileText,
      description: "Active reports requiring review",
      change: "+5%",
      href: "/admin/reports",
    },
    {
      title: "Admin Actions",
      value: 156, // This should come from a real API in production
      icon: ShieldAlert,
      description: "Admin actions taken this month",
      change: "-3%",
      href: "/admin/tools",
    },
    {
      title: "Analytics Views",
      value: 874, // This should come from a real API in production
      icon: BarChart3,
      description: "Data analytics dashboard views",
      change: "+25%",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Admin Portal</h2>
      <p className="text-muted-foreground">
        Welcome to the admin portal. Manage users, review reports, access admin tools,
        and analyze platform data.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-semibold mt-2">
                    {card.value.toLocaleString()}
                  </h3>
                  <p
                    className={`text-xs ${
                      card.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    } mt-1`}
                  >
                    {card.change} from last month
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {card.description}
                  </p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 