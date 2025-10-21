import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/useToast";
import { ParticipantList } from "./ParticipantList";
import { CompositionTimeline } from "./CompositionTimeline";
import { ChatPanel } from "./ChatPanel";
import { AIFeedbackPanel } from "./AIFeedbackPanel";
import { useWebSocket } from "@/hooks/useWebSocket";

interface CoCreationSessionProps {
  sessionId: string;
  onSessionEnd?: () => void;
}

export const CoCreationSession: React.FC<CoCreationSessionProps> = ({
  sessionId,
  onSessionEnd,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("composition");
  const [sessionState, setSessionState] = useState<any>(null);
  const timelineRef = useRef<any>(null);

  const handleWebSocketMessage = (message: any) => {
    const { type, data } = message;

    switch (type) {
      case "session_state":
        setSessionState(data);
        break;

      case "edit":
        timelineRef.current?.applyEdit(data);
        break;

      case "chat":
        // Handle in ChatPanel component
        break;

      case "ai_contribution":
        // Handle in AIFeedbackPanel component
        break;

      case "error":
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        break;
    }
  };

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:8000/ws/cocreation/${sessionId}/`,
    handleWebSocketMessage,
  );

  const handleEdit = (editData: any) => {
    sendMessage({
      action: "edit",
      payload: editData,
    });
  };

  const handleChatMessage = (message: string) => {
    sendMessage({
      action: "chat",
      payload: {
        message_type: "text",
        content: message,
      },
    });
  };

  const handleAIRequest = (requestType: string, context: any) => {
    sendMessage({
      action: "ai_request",
      payload: {
        contribution_type: requestType,
        context,
      },
    });
  };

  if (!sessionState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{sessionState.name}</CardTitle>
              <CardDescription>{sessionState.type} Session</CardDescription>
            </div>
            <Button variant="outline" onClick={onSessionEnd}>
              Leave Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="composition">Composition</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="ai">AI Feedback</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-12 gap-6 mt-6">
              {/* Left Sidebar - Always visible */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <ParticipantList participants={sessionState.participants} />
                </CardContent>
              </Card>

              {/* Main Content Area */}
              <div className="col-span-7">
                <TabsContent value="composition" className="m-0">
                  <Card>
                    <CardContent className="p-0">
                      <CompositionTimeline
                        ref={timelineRef}
                        composition={sessionState.current_composition}
                        onEdit={handleEdit}
                        className="h-[600px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chat" className="m-0">
                  <Card>
                    <CardContent>
                      <ChatPanel
                        onSendMessage={handleChatMessage}
                        className="h-[600px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="m-0">
                  <Card>
                    <CardContent>
                      <AIFeedbackPanel
                        onRequest={handleAIRequest}
                        className="h-[600px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              {/* Right Sidebar - Context-aware panel */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>
                    {activeTab === "composition"
                      ? "Properties"
                      : activeTab === "chat"
                        ? "Recent Activity"
                        : "AI Suggestions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {/* Dynamic content based on active tab */}
                    {activeTab === "composition" && (
                      <div className="space-y-4">
                        {/* Properties panel content */}
                      </div>
                    )}
                    {activeTab === "chat" && (
                      <div className="space-y-4">
                        {/* Activity log content */}
                      </div>
                    )}
                    {activeTab === "ai" && (
                      <div className="space-y-4">
                        {/* AI suggestions content */}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
