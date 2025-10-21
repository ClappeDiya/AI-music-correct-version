import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  participant?: {
    username: string;
    role: string;
  };
  content: string;
  timestamp: string;
  message_type: "text" | "notification" | "ai";
}

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onSendMessage,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    if (message.message_type === "notification") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground py-2"
        >
          {message.content}
        </motion.div>
      );
    }

    const isAI = message.message_type === "ai";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 mb-4",
          isAI ? "flex-row" : "flex-row-reverse",
        )}
      >
        {isAI ? (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
        ) : (
          message.participant && (
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.participant.username}`}
                alt={message.participant.username}
              />
              <AvatarFallback>
                {message.participant.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )
        )}

        <div
          className={cn(
            "max-w-[70%] rounded-lg p-3",
            isAI
              ? "bg-primary/10 text-primary-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {message.participant && (
            <p className="text-xs font-medium mb-1">
              {message.participant.username}
            </p>
          )}
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </ScrollArea>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 border-t"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
