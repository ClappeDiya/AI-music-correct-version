"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/Table";
import { toast } from "sonner";
import { 
  Loader2, 
  Shield, 
  FileDown, 
  TimerReset, 
  AlertTriangle, 
  History, 
  Lock, 
  User,
  Key
} from "lucide-react";
import { SettingsService } from "@/services/SettingsService";

const privacySchema = z.object({
  dataCollection: z.boolean(),
  analytics: z.boolean(),
  thirdPartySharing: z.boolean(),
  marketingCommunications: z.boolean(),
  rememberDevice: z.boolean(),
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.string(),
});

type PrivacyFormValues = z.infer<typeof privacySchema>;

export function DataPrivacy() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      dataCollection: true,
      analytics: true,
      thirdPartySharing: false,
      marketingCommunications: true,
      rememberDevice: true,
      twoFactorAuth: false,
      sessionTimeout: "30min",
    },
  });

  const onSubmit = async (data: PrivacyFormValues) => {
    setIsSubmitting(true);
    try {
      const settingsService = new SettingsService();
      // Using user id 1 for demonstration; in production, use the actual user id
      await settingsService.updateUserSettings(1, data);
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      toast.error("Failed to update privacy settings");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // In a real app, this would trigger a data export process
      // Example: const exportUrl = await dataService.requestExport();
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Data export initiated. You will receive a download link via email shortly.");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app, this would initiate account deletion
      // Example: await accountService.requestDeletion();
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Account deletion requested. You will receive a confirmation email with further instructions.");
    } catch (error) {
      toast.error("Failed to process account deletion request");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Mock data for access history
  const accessHistory = [
    { id: 1, device: "Windows Chrome", location: "New York, USA", time: "2023-11-20 14:30:45", status: "Success" },
    { id: 2, device: "iPhone Safari", location: "Los Angeles, USA", time: "2023-11-18 09:15:22", status: "Success" },
    { id: 3, device: "Android Firefox", location: "Unknown", time: "2023-11-15 22:45:10", status: "Failed" },
    { id: 4, device: "MacOS Chrome", location: "London, UK", time: "2023-11-10 11:05:37", status: "Success" },
    { id: 5, device: "iPad Safari", location: "Toronto, Canada", time: "2023-11-05 16:20:18", status: "Success" },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="privacy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Privacy Settings</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span>Data Management</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Access History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Data Collection</h3>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={form.control}
                        name="dataCollection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Usage Data Collection</FormLabel>
                              <FormDescription>
                                Allow collection of app usage data to improve services
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="analytics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Analytics</FormLabel>
                              <FormDescription>
                                Allow analytics to track app performance and usage patterns
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="thirdPartySharing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Third-Party Data Sharing</FormLabel>
                              <FormDescription>
                                Allow sharing your data with third-party services and partners
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marketingCommunications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Marketing Communications</FormLabel>
                              <FormDescription>
                                Receive marketing emails, notifications, and offers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Security</h3>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={form.control}
                        name="rememberDevice"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Remember Device</FormLabel>
                              <FormDescription>
                                Stay logged in on this device
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="twoFactorAuth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Two-Factor Authentication</FormLabel>
                              <FormDescription>
                                Secure your account with an additional verification step
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
                                onChange={field.onChange}
                                aria-label="Session Timeout"
                              >
                                <option value="15min">15 minutes</option>
                                <option value="30min">30 minutes</option>
                                <option value="1hr">1 hour</option>
                                <option value="4hr">4 hours</option>
                                <option value="8hr">8 hours</option>
                                <option value="1day">1 day</option>
                                <option value="never">Never timeout</option>
                              </select>
                            </FormControl>
                            <FormDescription>
                              Automatically log out after period of inactivity
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <CardFooter className="px-0 pb-0">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Privacy Settings"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <FileDown className="h-10 w-10 text-blue-500 mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Export Your Data</h3>
                    <p className="text-sm text-gray-500">
                      Download a copy of all the data associated with your account, including your profile information, 
                      projects, tracks, and settings. The export will be delivered to your email address as a ZIP file.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={handleExportData} 
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing Export...
                        </>
                      ) : "Request Data Export"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 space-y-4 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-10 w-10 text-destructive mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Delete Account</h3>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all associated data. This action cannot be undone.
                      All your projects, tracks, and settings will be permanently removed from our servers.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount} 
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : "Delete My Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Account Access History</CardTitle>
              <CardDescription>
                Review recent login activity and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Recent account access events (last 30 days)</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessHistory.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.device}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>{event.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === "Success" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {event.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full sm:w-auto">
                <Key className="mr-2 h-4 w-4" />
                Manage Authorized Devices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 