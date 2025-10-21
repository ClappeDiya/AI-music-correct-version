"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { 
  Settings, 
  User, 
  Shield, 
  Globe, 
  CreditCard,
  Lock,
  Loader2
} from "lucide-react";
import { UserProfile } from "@/app/settings/components/UserProfile";
import { BillingPayments } from "@/app/settings/components/BillingPayments";
import { AccessibilityLocalization } from "@/app/settings/components/AccessibilityLocalization";
import { DataPrivacy } from "@/app/settings/components/DataPrivacy";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuth, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Verify authentication first
    const verifyAuthAndInit = async () => {
      setIsLoading(true);
      try {
        // Verify user is authenticated
        await checkAuth();
        
        // Get the tab from the URL query parameter after authentication check
        if (searchParams) {
          const tabParam = searchParams.get("tab");
          if (tabParam && ["profile", "billing", "accessibility", "privacy"].includes(tabParam)) {
            setActiveTab(tabParam);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // If auth fails, redirect to login
        router.push("/auth/login?redirect_url=/settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuthAndInit();
  }, [searchParams, checkAuth, router]);

  // Handle tab change and update URL without full page reload
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL with the new tab value
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url.toString());
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <Card className="p-2">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary"
            >
              <User className="w-4 h-4 mr-2" />
              User Profile
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing & Payments
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Globe className="w-4 h-4 mr-2" />
              Accessibility & Localization
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="w-4 h-4 mr-2" />
              Data Privacy
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
        <TabsContent value="billing">
          <BillingPayments />
        </TabsContent>
        <TabsContent value="accessibility">
          <AccessibilityLocalization />
        </TabsContent>
        <TabsContent value="privacy">
          <DataPrivacy />
        </TabsContent>
      </Tabs>

      <Toaster position="top-right" />
    </div>
  );
}
