"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import { useVirtualStudio } from "@/hooks/useVirtualStudio";
import { directVirtualStudioApi } from "@/services/virtual_studio/direct-api";

export default function NewVirtualStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { api, isAuthenticated } = useVirtualStudio();
  
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!sessionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a session name",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const sessionData = {
      session_name: sessionName,
      description,
      is_public: isPublic,
      collaborators: []
    };
    
    // Create a timeout for the request
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      if (loading) {
        isTimedOut = true;
        setLoading(false);
        toast({
          title: "Request Timeout",
          description: "The request is taking longer than expected. Please try again.",
          variant: "destructive",
        });
      }
    }, 8000); // 8 seconds timeout
    
    try {
      console.log('[NewSession] Creating session:', sessionData);
      
      // First try with the direct API client for more reliable behavior
      let result;
      try {
        result = await directVirtualStudioApi.createSession(sessionData);
        console.log('[NewSession] Session created successfully with direct API');
      } catch (directApiError) {
        console.error('[NewSession] Direct API error:', directApiError);
        
        // If direct API fails, try with the regular API as fallback
        if (!isTimedOut && retryCount < 2) {
          console.log('[NewSession] Trying with regular API');
          result = await api.createSession(sessionData);
          console.log('[NewSession] Session created successfully with regular API');
        } else {
          throw directApiError;
        }
      }
      
      clearTimeout(timeoutId);
      
      if (isTimedOut) return; // Don't proceed if already timed out
      
      toast({
        title: "Success",
        description: "Session created successfully!",
      });
      
      // Navigate to the new session
      router.push(`/virtual_studio/${result.id}`);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (isTimedOut) return; // Don't show another error if already timed out
      
      console.error("Error creating session:", error);
      
      // If this is the first failure, increment retry count and try again
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Retrying...",
          description: "First attempt failed, trying again automatically",
        });
        
        // Small delay before retrying
        setTimeout(() => {
          handleSubmit(e);
        }, 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to create session after multiple attempts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      if (!isTimedOut) {
        setLoading(false);
      }
    }
  };
  
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Studio
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Studio Session</CardTitle>
          <CardDescription>
            Start a new virtual studio session for your music project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Session Name</Label>
              <Input
                id="sessionName"
                placeholder="Enter a name for your session"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your session (genre, instruments, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="isPublic">Make this session public</Label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !sessionName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
