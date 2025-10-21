"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  Shield, 
  BarChart, 
  Users, 
  Wrench,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { FuturisticThemeToggle } from "@/components/ui/FuturisticThemeToggle";
import { MobileThemeToggle } from "@/components/ui/MobileThemeToggle";

interface GlobalNavProps {
  className?: string;
}

export function GlobalNav({ className }: GlobalNavProps) {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  
  // Refs for hover detection
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const userInitials = React.useMemo(() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  }, [user]);

  // Use a timer to handle hover intent
  const hoverTimer = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleHoverStart = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    hoverTimer.current = setTimeout(() => {
      setOpen(true);
    }, 100); // Small delay to prevent accidental triggers
  };
  
  const handleHoverEnd = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    hoverTimer.current = setTimeout(() => {
      setOpen(false);
    }, 200); // Small delay before closing
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/project/dashboard" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-5 w-5 text-primary-foreground"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <path d="M3 10h18" />
                <path d="M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
                <circle cx="12" cy="16" r="2" />
                <path d="M12 14v-4" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden md:inline-flex">Retoone AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="text-foreground/60 hover:text-foreground"
              onClick={() => router.push("/project/dashboard")}
            >
              Projects
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground/60 hover:text-foreground"
              onClick={() => router.push("/project/new")}
            >
              Create New
            </Button>
          </nav>
        </div>

        {/* Mobile nav toggle */}
        <div className="md:hidden flex items-center gap-2">
          <MobileThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2"
            onClick={() => router.push("/project/dashboard")}
          >
            Projects
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <FuturisticThemeToggle className="hidden md:flex" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex items-center gap-1"
            onClick={() => router.push("/help")}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Button>
          
          <div 
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:block text-muted-foreground">Account</span>
              <div className="relative flex items-center">
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full border-2 border-primary hover:bg-primary/10 transition-colors" 
                      aria-label="User menu"
                    >
                      <Avatar className="bg-secondary">
                        <AvatarImage src={user?.avatarUrl} alt={user?.name || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <ChevronDown className="h-4 w-4 text-muted-foreground absolute -right-4 top-1/2 transform -translate-y-1/2" />
                  <DropdownMenuContent 
                    className="w-64" 
                    align="end" 
                    forceMount={false}
                    sideOffset={8}
                    onMouseEnter={handleHoverStart}
                    onMouseLeave={handleHoverEnd}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing & Payments</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>User Management</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/admin/tools")}>
                            <Wrench className="mr-2 h-4 w-4" />
                            <span>Admin Tools</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/admin/analytics")}>
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        router.push("/auth/login");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 