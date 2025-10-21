"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useVRDJStore, vrDjService, VRDJSession } from "@/services/vrDjService";
import { useToast } from "@/components/ui/useToast";

interface VRDJContextType {
  isVRSupported: boolean;
  isConnected: boolean;
  session: VRDJSession | null;
  startVRSession: () => Promise<void>;
  endVRSession: () => void;
  error: string | null;
}

const VRDJContext = createContext<VRDJContextType | undefined>(undefined);

export function VRDJProvider({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const { session, isVRSupported, isConnected, error } = useVRDJStore();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        await vrDjService.getSession(sessionId);
        await vrDjService.connectWebSocket(sessionId);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize VR DJ session:", error);
        toast({
          title: "Error",
          description: "Failed to initialize VR DJ session",
          variant: "destructive",
        });
      }
    };

    if (!isInitialized) {
      initializeSession();
    }

    return () => {
      vrDjService.disconnect();
    };
  }, [sessionId, isInitialized, toast]);

  const startVRSession = async () => {
    if (!isVRSupported) {
      toast({
        title: "Error",
        description: "VR is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession(
        "immersive-vr",
        {
          requiredFeatures: ["local-floor", "bounded-floor"],
          optionalFeatures: ["hand-tracking"],
        },
      );

      // Handle VR session setup
      session.addEventListener("end", () => {
        // Cleanup VR session
      });
    } catch (error) {
      console.error("Failed to start VR session:", error);
      toast({
        title: "Error",
        description: "Failed to start VR session",
        variant: "destructive",
      });
    }
  };

  const endVRSession = () => {
    // Implement VR session cleanup
  };

  const value = {
    isVRSupported,
    isConnected,
    session,
    startVRSession,
    endVRSession,
    error,
  };

  return <VRDJContext.Provider value={value}>{children}</VRDJContext.Provider>;
}

export function useVRDJ() {
  const context = useContext(VRDJContext);
  if (context === undefined) {
    throw new Error("useVRDJ must be used within a VRDJProvider");
  }
  return context;
}
