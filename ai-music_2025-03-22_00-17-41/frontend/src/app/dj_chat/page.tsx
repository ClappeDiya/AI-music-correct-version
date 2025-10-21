"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChatProvider } from "@/components/dj-chat/ChatProvider";
import { ChatWindow } from "@/components/dj-chat/ChatWindow";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

export default function DJChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user) {
      initializeChatSession();
    }
  }, [user, authLoading]);

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/ai_dj/dj_chat/sessions/", {
        is_ephemeral: true,
      });
      setSessionId(response.data.id);
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!sessionId) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to initialize chat session. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={initializeChatSession}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <Card className="p-4 hidden md:block">
          <CardHeader>
            <CardTitle>DJ Chat</CardTitle>
            <CardDescription>
              Chat with your AI DJ about music, get recommendations, and
              discover new tracks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => initializeChatSession()}
              >
                New Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChatProvider sessionId={sessionId}>
          <ChatWindow className="h-[calc(100vh-2rem)]" />
        </ChatProvider>
      </div>
    </div>
  );
}
