"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "./ChatProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/Switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  MessageCircle,
  Send,
  Music,
  Lightbulb,
  History,
  Loader2,
} from "lucide-react";

export function ChatWindow({ className }: { className?: string }) {
  const { messages, isLoading, error, sendMessage, isEphemeral, setEphemeral } =
    useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    setInput("");
    await sendMessage(trimmedInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI DJ Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="text-sm">Save History</span>
            <Switch
              checked={!isEphemeral}
              onCheckedChange={(checked) => setEphemeral(!checked)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollRef} className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.isAi ? "justify-start" : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    message.isAi
                      ? "bg-secondary"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {message.context?.type === "music_fact" && (
                    <Lightbulb className="h-4 w-4 mb-1" />
                  )}
                  {message.context?.suggestions ? (
                    <div className="space-y-2">
                      <p>{message.content}</p>
                      <div className="space-y-1">
                        {message.context.suggestions.map(
                          (suggestion: string, i: number) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                setInput(suggestion);
                              }}
                            >
                              {suggestion}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  {message.context?.currentTrack && (
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                      <Music className="h-3 w-3" />
                      <span>{message.context.currentTrack}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Input
            placeholder="Ask me anything about music..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
