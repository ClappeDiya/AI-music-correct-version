"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { create } from "zustand";

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  context?: Record<string, any>;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatStore extends ChatState {
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));

interface ChatContextType {
  sendMessage: (
    content: string,
    context?: Record<string, any>,
  ) => Promise<void>;
  isEphemeral: boolean;
  setEphemeral: (ephemeral: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) {
  const [isEphemeral, setEphemeral] = useState(true);
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);

  useEffect(() => {
    // Load chat history if not ephemeral
    if (!isEphemeral) {
      loadChatHistory();
    }
  }, [isEphemeral, sessionId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/ai_dj/dj_chat/sessions/${sessionId}/messages/`,
      );
      response.data.forEach((message: any) => {
        addMessage({
          id: message.id,
          content: message.content,
          isAi: message.is_ai,
          context: message.context,
          createdAt: message.created_at,
        });
      });
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setError("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    content: string,
    context?: Record<string, any>,
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isAi: false,
        context,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Send message to backend
      const response = await axios.post(
        `/api/ai_dj/dj_chat/sessions/${sessionId}/send_message/`,
        {
          message: content,
          context,
        },
      );

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.message,
        isAi: true,
        context: response.data.context,
        createdAt: new Date().toISOString(),
      };
      addMessage(aiMessage);

      // Handle suggestions and music facts if present
      if (response.data.suggestions?.length > 0) {
        addMessage({
          id: (Date.now() + 2).toString(),
          content: "You might want to try asking:",
          isAi: true,
          context: { suggestions: response.data.suggestions },
          createdAt: new Date().toISOString(),
        });
      }

      if (response.data.music_fact) {
        addMessage({
          id: (Date.now() + 3).toString(),
          content: `Fun Fact: ${response.data.music_fact.content}`,
          isAi: true,
          context: { type: "music_fact" },
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ sendMessage, isEphemeral, setEphemeral }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return {
    ...context,
    ...useChatStore(),
  };
}
