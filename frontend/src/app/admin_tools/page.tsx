"use client";

import { Card } from "@/components/ui/Card";
import { useAdminStats } from "@/services/AdminService";

import { Users, Music2, MessageSquare, AlertTriangle } from "lucide-react";

// Removed metadata export to avoid conflict with 'use client' directive.
// export const metadata: Metadata = {
//   title: 'Admin Tools | AI Music',
//   description: 'Administration and moderation tools for AI Music platform',
// };

export default function AdminDashboardPage() {
  const { data: stats } = useAdminStats();

  const overviewCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      change: "+12%",
    },
    {
      title: "Active Tracks",
      value: stats?.activeTracks ?? 0,
      icon: Music2,
      change: "+8%",
    },
    {
      title: "New Comments",
      value: stats?.newComments ?? 0,
      icon: MessageSquare,
      change: "+21%",
    },
    {
      title: "Reports",
      value: stats?.reports ?? 0,
      icon: AlertTriangle,
      change: "-5%",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => {
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
