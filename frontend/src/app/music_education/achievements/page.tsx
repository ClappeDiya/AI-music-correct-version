"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AchievementShowcaseSection } from '@/components/music-education/sections/achievement-showcase-section";
import { AchievementAnalyticsSection } from '@/components/music-education/sections/achievement-analytics-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Share2, Twitter, Facebook, Linkedin, Link } from "lucide-react";
import { toast } from "sonner";
import { musicEducationApi } from '@/services/music_education_api";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await musicEducationApi.getUserAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (achievement: any) => {
    setSelectedAchievement(achievement);
    setShowShareDialog(true);
  };

  const shareToSocialMedia = async (platform: "twitter" | "facebook" | "linkedin") => {
    if (!selectedAchievement) return;

    const shareText = `I just unlocked the "${selectedAchievement.title}" achievement in Music Education! 🎵🏆`;
    const shareUrl = `${window.location.origin}/achievements/${selectedAchievement.id}`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
    setShowShareDialog(false);
  };

  const copyShareLink = async () => {
    if (!selectedAchievement) return;

    const shareUrl = `${window.location.origin}/achievements/${selectedAchievement.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy share link:", error);
      toast.error("Failed to copy share link");
    }
  };

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <Tabs defaultValue="showcase">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="showcase" className="mt-6">
          <AchievementShowcaseSection
            achievements={achievements}
            onShare={handleShare}
          />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <AchievementAnalyticsSection />
        </TabsContent>
      </Tabs>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Achievement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocialMedia("twitter")}
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocialMedia("facebook")}
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareToSocialMedia("linkedin")}
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex space-x-2">
              <Input
                readOnly
                value={selectedAchievement ? `${window.location.origin}/achievements/${selectedAchievement.id}` : ""}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyShareLink}>
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 

