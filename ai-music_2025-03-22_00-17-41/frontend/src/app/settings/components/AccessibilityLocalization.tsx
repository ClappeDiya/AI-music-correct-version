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
import { Slider } from "@/components/ui/Slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { toast } from "sonner";
import { Loader2, Globe, Eye, Volume2, Vibrate, Type } from "lucide-react";

const accessibilitySchema = z.object({
  textSize: z.number().min(80).max(200),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  screenReaderOptimized: z.boolean(),
  colorBlindMode: z.string(),
  autoPlayMedia: z.boolean(),
  vibration: z.boolean(),
  soundEffects: z.boolean(),
  hapticFeedback: z.boolean(),
});

const localizationSchema = z.object({
  language: z.string(),
  region: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  timezone: z.string(),
  currency: z.string(),
  firstDayOfWeek: z.string(),
  measurementUnit: z.string(),
});

type AccessibilityFormValues = z.infer<typeof accessibilitySchema>;
type LocalizationFormValues = z.infer<typeof localizationSchema>;

export function AccessibilityLocalization() {
  const [isSubmittingAccessibility, setIsSubmittingAccessibility] = useState(false);
  const [isSubmittingLocalization, setIsSubmittingLocalization] = useState(false);
  
  const accessibilityForm = useForm<AccessibilityFormValues>({
    resolver: zodResolver(accessibilitySchema),
    defaultValues: {
      textSize: 100,
      highContrast: false,
      reducedMotion: false,
      screenReaderOptimized: false,
      colorBlindMode: "none",
      autoPlayMedia: true,
      vibration: true,
      soundEffects: true,
      hapticFeedback: true,
    },
  });

  const localizationForm = useForm<LocalizationFormValues>({
    resolver: zodResolver(localizationSchema),
    defaultValues: {
      language: "en",
      region: "US",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "America/New_York",
      currency: "USD",
      firstDayOfWeek: "sunday",
      measurementUnit: "imperial",
    },
  });

  const onSubmitAccessibility = async (data: AccessibilityFormValues) => {
    setIsSubmittingAccessibility(true);
    try {
      // In a real app, you would have an API call to update accessibility settings
      // Example: await settingsService.updateAccessibilitySettings(data);
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Accessibility settings updated successfully");
    } catch (error) {
      toast.error("Failed to update accessibility settings");
      console.error(error);
    } finally {
      setIsSubmittingAccessibility(false);
    }
  };

  const onSubmitLocalization = async (data: LocalizationFormValues) => {
    setIsSubmittingLocalization(true);
    try {
      // In a real app, you would have an API call to update localization settings
      // Example: await settingsService.updateLocalizationSettings(data);
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Localization settings updated successfully");
    } catch (error) {
      toast.error("Failed to update localization settings");
      console.error(error);
    } finally {
      setIsSubmittingLocalization(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="accessibility" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Accessibility</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Localization</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>
                Customize your experience to make the application more accessible for your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form 
                onSubmit={accessibilityForm.handleSubmit(onSubmitAccessibility)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Display Settings</h3>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={accessibilityForm.control}
                        name="textSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Size ({field.value}%)</FormLabel>
                            <FormControl>
                              <Slider
                                min={80}
                                max={200}
                                step={5}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Adjust the size of text throughout the application
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accessibilityForm.control}
                        name="highContrast"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>High Contrast</FormLabel>
                              <FormDescription>
                                Increase contrast for better readability
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
                        control={accessibilityForm.control}
                        name="colorBlindMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Blind Mode</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color blind mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="protanopia">Protanopia</SelectItem>
                                  <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                                  <SelectItem value="tritanopia">Tritanopia</SelectItem>
                                  <SelectItem value="achromatopsia">Achromatopsia</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Adjust colors to accommodate color blindness
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Media & Interaction</h3>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={accessibilityForm.control}
                        name="reducedMotion"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Reduced Motion</FormLabel>
                              <FormDescription>
                                Minimize animations and motion effects
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
                        control={accessibilityForm.control}
                        name="screenReaderOptimized"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Screen Reader Optimized</FormLabel>
                              <FormDescription>
                                Enhance compatibility with screen readers
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
                        control={accessibilityForm.control}
                        name="autoPlayMedia"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Auto-Play Media</FormLabel>
                              <FormDescription>
                                Automatically play audio and video content
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
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Vibrate className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Feedback & Notifications</h3>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={accessibilityForm.control}
                        name="soundEffects"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Sound Effects</FormLabel>
                              <FormDescription>
                                Play sounds for actions and notifications
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
                        control={accessibilityForm.control}
                        name="vibration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Vibration</FormLabel>
                              <FormDescription>
                                Enable vibration feedback on supported devices
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
                        control={accessibilityForm.control}
                        name="hapticFeedback"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Haptic Feedback</FormLabel>
                              <FormDescription>
                                Enable haptic feedback for touch interactions
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
                </div>
                
                <CardFooter className="px-0 pb-0">
                  <Button type="submit" disabled={isSubmittingAccessibility}>
                    {isSubmittingAccessibility ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Accessibility Settings"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>Localization Settings</CardTitle>
              <CardDescription>
                Customize language, region, and format preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form 
                onSubmit={localizationForm.handleSubmit(onSubmitLocalization)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={localizationForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                              <SelectItem value="ja">日本語</SelectItem>
                              <SelectItem value="zh">中文</SelectItem>
                              <SelectItem value="ko">한국어</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Application display language
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="IN">India</SelectItem>
                              <SelectItem value="JP">Japan</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Your geographical region
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                              <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                              <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                              <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Your local timezone
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">US Dollar ($)</SelectItem>
                              <SelectItem value="EUR">Euro (€)</SelectItem>
                              <SelectItem value="GBP">British Pound (£)</SelectItem>
                              <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                              <SelectItem value="CAD">Canadian Dollar (CA$)</SelectItem>
                              <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                              <SelectItem value="CNY">Chinese Yuan (¥)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Currency for payments and pricing
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          How dates should be displayed
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Format</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                              <SelectItem value="24h">24-hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          How times should be displayed
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="firstDayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Day of Week</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select first day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunday">Sunday</SelectItem>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Starting day for calendar week
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="measurementUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Measurement System</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select measurement system" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="imperial">Imperial (ft, lb)</SelectItem>
                              <SelectItem value="metric">Metric (m, kg)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Units for measurements and distances
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className="px-0 pb-0">
                  <Button type="submit" disabled={isSubmittingLocalization}>
                    {isSubmittingLocalization ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Localization Settings"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 