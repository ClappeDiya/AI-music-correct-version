"use client";

import { FeatureRequest } from "@/services/featureRequestService";
import { FeatureRequestCard } from "./FeatureRequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";

interface FeatureRequestGridProps {
  topVotedRequests: FeatureRequest[];
  allRequests: FeatureRequest[];
  myRequests: FeatureRequest[];
  myVotedRequests: FeatureRequest[];
  isLoading: boolean;
  onVote: (id: string) => Promise<void>;
  onUnvote: (id: string) => Promise<void>;
}

export function FeatureRequestGrid({
  topVotedRequests,
  allRequests,
  myRequests,
  myVotedRequests,
  isLoading,
  onVote,
  onUnvote,
}: FeatureRequestGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="top" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="top">Top Voted</TabsTrigger>
        <TabsTrigger value="all">All Requests</TabsTrigger>
        <TabsTrigger value="my">My Requests</TabsTrigger>
        <TabsTrigger value="voted">My Votes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="top">
        {topVotedRequests.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topVotedRequests.map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  featureRequest={request}
                  onVote={onVote}
                  onUnvote={onUnvote}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No feature requests found. Be the first to submit a request!
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="all">
        {allRequests.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRequests.map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  featureRequest={request}
                  onVote={onVote}
                  onUnvote={onUnvote}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No feature requests found. Be the first to submit a request!
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="my">
        {myRequests.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRequests.map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  featureRequest={request}
                  onVote={onVote}
                  onUnvote={onUnvote}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            You haven't submitted any feature requests yet.
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="voted">
        {myVotedRequests.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myVotedRequests.map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  featureRequest={request}
                  onVote={onVote}
                  onUnvote={onUnvote}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            You haven't voted on any feature requests yet.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 