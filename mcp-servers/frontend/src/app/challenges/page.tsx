"use client";

import { useEffect, useState } from "react";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { useToast } from "@/components/ui/usetoast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  submissionCount: number;
  isActive: boolean;
  isRegistered: boolean;
}

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (!response.ok) throw new Error("Failed to fetch challenges");
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/register`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to register");

      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.id === challengeId
            ? { ...challenge, isRegistered: true }
            : challenge,
        ),
      );

      toast({
        title: "Success",
        description: "You have successfully registered for the challenge.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (challengeId: string) => {
    window.location.href = `/challenges/${challengeId}`;
  };

  const filteredChallenges = challenges.filter((challenge) =>
    activeTab === "active" ? challenge.isActive : !challenge.isActive,
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Music Challenges</h1>

      <Tabs defaultValue="active" className="w-full mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" onClick={() => setActiveTab("active")}>
            Active Challenges
          </TabsTrigger>
          <TabsTrigger value="past" onClick={() => setActiveTab("past")}>
            Past Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onRegister={handleRegister}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No active challenges at the moment.
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onRegister={handleRegister}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No past challenges found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
