"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Shield } from "lucide-react";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { FollowRequests } from "@/components/settings/FollowRequests";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
          <CardDescription>
            Manage your privacy settings and control who can interact with your
            content
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <PrivacySettings />
        </div>
        <div>
          <FollowRequests />
        </div>
      </div>
    </div>
  );
}
