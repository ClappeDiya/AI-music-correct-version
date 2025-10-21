"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Lightbulb, ThumbsUp, HelpCircle } from "lucide-react";

interface FeedbackNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: FeedbackNavItem[] = [
  {
    href: "/feedback",
    label: "General Feedback",
    icon: <MessageSquare className="h-4 w-4 mr-2" />,
  },
  {
    href: "/feedback/feature-requests",
    label: "Feature Requests",
    icon: <Lightbulb className="h-4 w-4 mr-2" />,
  },
  {
    href: "/feedback/surveys",
    label: "Surveys",
    icon: <ThumbsUp className="h-4 w-4 mr-2" />,
  },
  {
    href: "/feedback/faq",
    label: "FAQ",
    icon: <HelpCircle className="h-4 w-4 mr-2" />,
  },
];

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] mt-8">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
} 