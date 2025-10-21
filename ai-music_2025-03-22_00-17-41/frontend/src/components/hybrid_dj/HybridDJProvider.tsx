"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  hybridDjService,
  AIRecommendation,
  HumanDJAction,
} from "@/services/hybridDjService";
import { useToast } from "@/components/ui/useToast";

interface HybridDJState {
  recommendations: AIRecommendation[];
  recentActions: HumanDJAction[];
  loading: boolean;
  error: string | null;
}

type HybridDJAction =
  | { type: "SET_RECOMMENDATIONS"; payload: AIRecommendation[] }
  | { type: "SET_RECENT_ACTIONS"; payload: HumanDJAction[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_RECOMMENDATION"; payload: AIRecommendation }
  | { type: "ADD_ACTION"; payload: HumanDJAction };

interface HybridDJContextType extends HybridDJState {
  acceptRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string, reason?: string) => Promise<void>;
  recordAction: (data: {
    action_type: string;
    track?: string;
    parameters: Record<string, any>;
  }) => Promise<void>;
}

const HybridDJContext = createContext<HybridDJContextType | undefined>(
  undefined,
);

const initialState: HybridDJState = {
  recommendations: [],
  recentActions: [],
  loading: true,
  error: null,
};

function hybridDJReducer(
  state: HybridDJState,
  action: HybridDJAction,
): HybridDJState {
  switch (action.type) {
    case "SET_RECOMMENDATIONS":
      return { ...state, recommendations: action.payload };
    case "SET_RECENT_ACTIONS":
      return { ...state, recentActions: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_RECOMMENDATION":
      return {
        ...state,
        recommendations: state.recommendations.map((rec) =>
          rec.id === action.payload.id ? action.payload : rec,
        ),
      };
    case "ADD_ACTION":
      return {
        ...state,
        recentActions: [action.payload, ...state.recentActions],
      };
    default:
      return state;
  }
}

export function HybridDJProvider({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId: string;
}) {
  const [state, dispatch] = useReducer(hybridDJReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const [recommendations, actions] = await Promise.all([
          hybridDjService.getPendingRecommendations(sessionId),
          hybridDjService.getSessionActions(sessionId),
        ]);
        dispatch({ type: "SET_RECOMMENDATIONS", payload: recommendations });
        dispatch({ type: "SET_RECENT_ACTIONS", payload: actions });
      } catch (error) {
        console.error("Failed to fetch hybrid DJ data:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to load hybrid DJ data",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  const acceptRecommendation = async (id: string) => {
    try {
      const updatedRec = await hybridDjService.acceptRecommendation(id);
      dispatch({ type: "UPDATE_RECOMMENDATION", payload: updatedRec });
      toast({
        title: "Success",
        description: "Recommendation accepted successfully",
      });
    } catch (error) {
      console.error("Failed to accept recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to accept recommendation",
        variant: "destructive",
      });
    }
  };

  const rejectRecommendation = async (id: string, reason?: string) => {
    try {
      const updatedRec = await hybridDjService.rejectRecommendation(id, reason);
      dispatch({ type: "UPDATE_RECOMMENDATION", payload: updatedRec });
      toast({
        title: "Success",
        description: "Recommendation rejected successfully",
      });
    } catch (error) {
      console.error("Failed to reject recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to reject recommendation",
        variant: "destructive",
      });
    }
  };

  const recordAction = async (data: {
    action_type: string;
    track?: string;
    parameters: Record<string, any>;
  }) => {
    try {
      const action = await hybridDjService.recordAction({
        session: sessionId,
        ...data,
      });
      dispatch({ type: "ADD_ACTION", payload: action });
    } catch (error) {
      console.error("Failed to record action:", error);
      toast({
        title: "Error",
        description: "Failed to record action",
        variant: "destructive",
      });
    }
  };

  const value = {
    ...state,
    acceptRecommendation,
    rejectRecommendation,
    recordAction,
  };

  return (
    <HybridDJContext.Provider value={value}>
      {children}
    </HybridDJContext.Provider>
  );
}

export function useHybridDJ() {
  const context = useContext(HybridDJContext);
  if (context === undefined) {
    throw new Error("useHybridDJ must be used within a HybridDJProvider");
  }
  return context;
}
