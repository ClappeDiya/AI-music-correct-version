"use client";

import { useState } from "react";
import { useFeatureRequests } from "@/hooks/useFeatureRequests";
import { FeatureRequestGrid } from "@/components/feature_requests/FeatureRequestGrid";
import { FeatureRequestForm } from "@/components/feature_requests/FeatureRequestForm";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { FeatureRequest } from "@/services/featureRequestService";

export default function FeatureRequestsPage() {
  const {
    featureRequests,
    topVotedRequests,
    myRequests,
    myVotedRequests,
    loading,
    createFeatureRequest,
    voteForFeatureRequest,
    removeVoteForFeatureRequest,
  } = useFeatureRequests();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateFeatureRequest = async (data: Omit<FeatureRequest, "id" | "votes_count" | "has_voted" | "user" | "submitted_by_name" | "created_at" | "updated_at">) => {
    try {
      await createFeatureRequest(data);
      setIsFormOpen(false);
      toast({
        title: "Feature request submitted",
        description: "Your feature request has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feature request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (id: string) => {
    try {
      await voteForFeatureRequest(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote for feature request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnvote = async (id: string) => {
    try {
      await removeVoteForFeatureRequest(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
          <p className="text-muted-foreground mt-1 mb-4 md:mb-0">
            Submit ideas for new features and vote on requests from other users
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Submit New Request
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
        <FeatureRequestGrid
          topVotedRequests={topVotedRequests}
          allRequests={featureRequests}
          myRequests={myRequests}
          myVotedRequests={myVotedRequests}
          isLoading={loading}
          onVote={handleVote}
          onUnvote={handleUnvote}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Submit a New Feature Request
            </DialogTitle>
            <DialogDescription>
              Describe a feature you'd like to see added to the platform. Provide as much detail as possible.
            </DialogDescription>
          </DialogHeader>
          <FeatureRequestForm
            onSubmit={handleCreateFeatureRequest}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 