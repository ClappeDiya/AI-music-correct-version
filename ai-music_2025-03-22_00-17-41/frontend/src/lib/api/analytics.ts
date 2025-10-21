import type { ListeningStats, AggregateData } from "@/types/analytics";

export async function getListeningStats(): Promise<ListeningStats> {
  const response = await fetch("/api/analytics/listening-stats");
  if (!response.ok) throw new Error("Failed to fetch listening stats");
  return response.json();
}

export interface Collaborator {
  id: string;
  name: string;
  interactions: number;
}

export async function getCollaborators(): Promise<Collaborator[]> {
  const response = await fetch("/api/analytics/collaborators");
  if (!response.ok) throw new Error("Failed to fetch collaborators");
  return response.json();
}

export async function getTrackAnalyticsAggregates(): Promise<AggregateData> {
  const response = await fetch("/api/analytics/aggregates");
  if (!response.ok) throw new Error("Failed to fetch analytics aggregates");
  return response.json();
}
