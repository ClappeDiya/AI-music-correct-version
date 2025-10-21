"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  CreditCard,
  User,
  Settings,
  Accessibility,
  BarChart,
  Users,
  Music,
  Shuffle,
  Mic,
  Smile,
  Headphones,
  Monitor,
  MessageSquare,
  BookOpen,
  Shield,
  FileText,
  Zap,
  Share2,
} from "lucide-react";

const navItems = [
  { name: "Billing & Payments", href: "/billing", icon: CreditCard },
  { name: "User Management", href: "/user-management", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  {
    name: "Accessibility & Localization",
    href: "/accessibility-localization",
    icon: Accessibility,
  },
  {
    name: "Data Analytics & Recommendations",
    href: "/data-analytics",
    icon: BarChart,
  },
  { name: "Social & Community", href: "/social-community", icon: Users },
  { name: "AI Music Generation", href: "/ai-music-generation", icon: Music },
  { name: "Genre Mixing & Creation", href: "/genre-mixing", icon: Shuffle },
  { name: "Voice Cloning", href: "/voice-cloning", icon: Mic },
  { name: "Mood-Based Music Generation", href: "/mood-music", icon: Smile },
  { name: "AI DJ", href: "/ai-dj", icon: Headphones },
  {
    name: "Virtual Studio & Instrument Simulation",
    href: "/virtual-studio",
    icon: Monitor,
  },
  {
    name: "Lyrics Generation & Integration",
    href: "/lyrics-generation",
    icon: MessageSquare,
  },
  {
    name: "Music Education & Tutorials",
    href: "/music-education",
    icon: BookOpen,
  },
  { name: "Admin & Moderation", href: "/admin-moderation", icon: Shield },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Future Capabilities", href: "/future-capabilities", icon: Zap },
  {
    name: "Copyright-Free Music Sharing",
    href: "/copyright-sharing",
    icon: Share2,
  },
];

interface DashboardContentProps {
  session: Session;
}

export default function DashboardContent({ session }: DashboardContentProps) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">
        Welcome, {session.user?.name || session.user?.email}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Icon className="h-6 w-6" />
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access and manage your {item.name.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
