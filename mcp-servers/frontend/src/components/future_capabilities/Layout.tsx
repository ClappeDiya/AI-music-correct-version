import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/Separator';
import { 
  VrHeadset, 
  Users, 
  ActivitySquare, 
  Bot, 
  Palette, 
  Smartphone,
  Brain,
  Link2,
  AppWindow,
  MessageSquare,
  Map,
  Server,
  Flask,
  Network,
  Bot as AIBot,
  Waves,
  Layers,
  GitBranch,
  Rocket
} from "lucide-react";

const navigation = [
  { name: "VR Environments", href: '/future_capabilities/vr-environments", icon: VrHeadset },
  { name: "Collaboration", href: '/future_capabilities/collaboration", icon: Users },
  { name: "Activity Logs", href: '/future_capabilities/activity-logs", icon: ActivitySquare },
  { name: "AI Plugins", href: '/future_capabilities/ai-plugins", icon: Bot },
  { name: "User Styles", href: '/future_capabilities/user-styles", icon: Palette },
  { name: "Device Integration", href: '/future_capabilities/device-integration", icon: Smartphone },
  { name: "Biofeedback", href: '/future_capabilities/biofeedback", icon: Brain },
  { name: "Third Party", href: '/future_capabilities/third-party", icon: Link2 },
  { name: "Mini Apps", href: '/future_capabilities/mini-apps", icon: AppWindow },
  { name: "User Feedback", href: '/future_capabilities/user-feedback", icon: MessageSquare },
  { name: "Feature Roadmap", href: '/future_capabilities/feature-roadmap", icon: Map },
  { name: "Microservices", href: '/future_capabilities/microservices", icon: Server },
  { name: "Microfluidic", href: '/future_capabilities/microfluidic", icon: Flask },
  { name: "Dimensionality", href: '/future_capabilities/dimensionality", icon: Network },
  { name: "AI Partnerships", href: '/future_capabilities/ai-partnerships", icon: AIBot },
  { name: "Synesthetic", href: '/future_capabilities/synesthetic", icon: Waves },
  { name: "Semantic Layers", href: '/future_capabilities/semantic-layers", icon: Layers },
  { name: "Pipeline Evolution", href: '/future_capabilities/pipeline-evolution", icon: GitBranch },
  { name: "Interstellar", href: '/future_capabilities/interstellar", icon: Rocket },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="p-4">
              <SheetTitle>Future Capabilities</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-64px)]">
              <div className="space-y-4">
                <nav className="grid gap-1 px-2">
                  {navigation.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        item.href === window.location.pathname &&
                          "bg-muted font-medium"
                      )}
                      onClick={() => {
                        window.location.href = item.href;
                        setIsOpen(false);
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Future Capabilities</h1>
        </div>
      </header>
      <div className="flex-1">
        <div className="container flex-1 items-start lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-16 z-30 hidden h-[calc(100vh-64px)] w-full shrink-0 overflow-y-auto border-r lg:sticky lg:block">
            <ScrollArea className="py-6 pr-6">
              <nav className="grid gap-1">
                {navigation.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      item.href === window.location.pathname &&
                        "bg-muted font-medium"
                    )}
                    onClick={() => {
                      window.location.href = item.href;
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
          <main className="flex w-full flex-col overflow-hidden">
            <div className="flex-1">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MenuIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

