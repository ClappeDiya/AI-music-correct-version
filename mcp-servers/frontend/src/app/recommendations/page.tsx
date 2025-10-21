import { RecommendationList } from "./components/RecommendationList";
import { User } from "@/types/recommendation";

async function getRecommendations(): Promise<User[]> {
  const response = await fetch("/api/recommendations");
  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }
  return response.json();
}

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action: "follow",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="text-muted-foreground">
          Discover new collaborators based on your music preferences
        </p>
      </div>

      <RecommendationList
        recommendations={recommendations}
        onFollow={handleFollow}
      />
    </div>
  );
}
