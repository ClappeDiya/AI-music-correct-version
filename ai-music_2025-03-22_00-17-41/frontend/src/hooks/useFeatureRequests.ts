import { useState, useEffect, useCallback } from "react";
import featureRequestService, { FeatureRequest } from "@/services/featureRequestService";
import { useToast } from "@/components/ui/useToast";

export function useFeatureRequests() {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [topVotedRequests, setTopVotedRequests] = useState<FeatureRequest[]>([]);
  const [myRequests, setMyRequests] = useState<FeatureRequest[]>([]);
  const [myVotedRequests, setMyVotedRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeatureRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await featureRequestService.getFeatureRequests();
      setFeatureRequests(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch feature requests");
      toast({
        title: "Error",
        description: "Failed to fetch feature requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchTopVotedRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await featureRequestService.getTopVotedFeatureRequests();
      setTopVotedRequests(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch top voted requests");
      toast({
        title: "Error",
        description: "Failed to fetch top voted requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await featureRequestService.getMyFeatureRequests();
      setMyRequests(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch your requests");
      toast({
        title: "Error",
        description: "Failed to fetch your requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMyVotedRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await featureRequestService.getMyVotedFeatureRequests();
      setMyVotedRequests(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch your voted requests");
      toast({
        title: "Error",
        description: "Failed to fetch your voted requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFeatureRequest = useCallback(async (
    featureRequestData: Omit<FeatureRequest, "id" | "votes_count" | "has_voted" | "user" | "submitted_by_name" | "created_at" | "updated_at">
  ) => {
    try {
      setLoading(true);
      const newRequest = await featureRequestService.createFeatureRequest(featureRequestData);
      setFeatureRequests(prev => [newRequest, ...prev]);
      setMyRequests(prev => [newRequest, ...prev]);
      toast({
        title: "Success",
        description: "Feature request submitted successfully",
      });
      return newRequest;
    } catch (err) {
      setError("Failed to create feature request");
      toast({
        title: "Error",
        description: "Failed to create feature request",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const voteForFeatureRequest = useCallback(async (id: string) => {
    try {
      const updatedRequest = await featureRequestService.voteForFeatureRequest(id);
      
      // Update in all lists
      setFeatureRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      setTopVotedRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      setMyVotedRequests(prev => [...prev, updatedRequest]);
      
      toast({
        title: "Success",
        description: "Vote submitted successfully",
      });
      return updatedRequest;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to vote for feature request",
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const removeVoteForFeatureRequest = useCallback(async (id: string) => {
    try {
      const updatedRequest = await featureRequestService.removeVoteForFeatureRequest(id);
      
      // Update in all lists
      setFeatureRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      setTopVotedRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      setMyVotedRequests(prev => 
        prev.filter(req => req.id !== id)
      );
      
      toast({
        title: "Success",
        description: "Vote removed successfully",
      });
      return updatedRequest;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove vote",
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    fetchFeatureRequests();
    fetchTopVotedRequests();
    fetchMyRequests();
    fetchMyVotedRequests();
  }, [fetchFeatureRequests, fetchTopVotedRequests, fetchMyRequests, fetchMyVotedRequests]);

  return {
    featureRequests,
    topVotedRequests,
    myRequests,
    myVotedRequests,
    loading,
    error,
    refreshFeatureRequests: fetchFeatureRequests,
    refreshTopVotedRequests: fetchTopVotedRequests,
    refreshMyRequests: fetchMyRequests,
    refreshMyVotedRequests: fetchMyVotedRequests,
    createFeatureRequest,
    voteForFeatureRequest,
    removeVoteForFeatureRequest,
  };
} 