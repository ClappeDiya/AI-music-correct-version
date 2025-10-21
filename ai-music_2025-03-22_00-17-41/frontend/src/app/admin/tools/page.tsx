"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
  ShieldAlert, 
  ServerCrash, 
  Settings, 
  Users, 
  Database, 
  HardDrive, 
  Shield, 
  Bell, 
  FileCode,
  FolderKey
} from "lucide-react";

export default function AdminTools() {
  // In a real app, these functions would make API calls
  const handleBackupClick = () => {
    console.log("Database backup initiated");
  };
  
  const handleClearCacheClick = () => {
    console.log("Cache clearing initiated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Tools</h2>
      </div>
      
      <p className="text-muted-foreground">
        Access system management tools and utilities. Use these tools with caution as they can affect the entire platform.
      </p>
      
      <Tabs defaultValue="system">
        <TabsList className="mb-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="m-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Management</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Manage database operations including backups, optimization, and recovery.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={handleBackupClick}>
                    Backup Database
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Database Status
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Management</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Manage application cache and performance optimizations.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={handleClearCacheClick}>
                    Clear Cache
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Cache Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Configure system-wide settings and parameters.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Environment Settings
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Feature Flags
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="m-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Access Control</CardTitle>
                <FolderKey className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Manage role-based access control and permissions.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Manage Roles
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Audit Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Policies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Configure platform security policies and protection.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Password Policies
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threat Protection</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Monitor and protect against security threats.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    IP Blocking
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Threat Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance" className="m-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Mode</CardTitle>
                <ServerCrash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Enable maintenance mode for platform updates.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full" variant="destructive">
                    Enable Maintenance Mode
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Schedule Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Logs</CardTitle>
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  View and analyze system logs for troubleshooting.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Application Logs
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Error Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <ServerCrash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Monitor system health and performance metrics.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Health Dashboard
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Performance Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="m-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Send platform-wide notifications to all users.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Create Announcement
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Past Announcements
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Manage system email templates and notifications.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Edit Templates
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Notifications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mt-2 mb-4">
                  Send targeted notifications to specific user groups.
                </CardDescription>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Create User Notification
                  </Button>
                  <Button size="sm" className="w-full" variant="outline">
                    Notification History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 