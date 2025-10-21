import axios from "axios";

// Make sure API requests are directed to the Next.js API routes
const API_URL = "/api";

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  user: string;
  submitted_by_name: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  votes_count: number;
  has_voted: boolean;
}

class FeatureRequestService {
  async getFeatureRequests(): Promise<FeatureRequest[]> {
    const response = await axios.get(`${API_URL}/feature-requests`);
    return response.data;
  }

  async getTopVotedFeatureRequests(): Promise<FeatureRequest[]> {
    const response = await axios.get(`${API_URL}/feature-requests/top_voted`);
    return response.data;
  }

  async getMyFeatureRequests(): Promise<FeatureRequest[]> {
    const response = await axios.get(`${API_URL}/feature-requests/my_requests`);
    return response.data;
  }

  async getMyVotedFeatureRequests(): Promise<FeatureRequest[]> {
    const response = await axios.get(`${API_URL}/feature-requests/my_votes`);
    return response.data;
  }

  async createFeatureRequest(
    featureRequestData: Omit<FeatureRequest, "id" | "votes_count" | "has_voted" | "user" | "submitted_by_name" | "created_at" | "updated_at">
  ): Promise<FeatureRequest> {
    const response = await axios.post(`${API_URL}/feature-requests`, featureRequestData);
    return response.data;
  }

  async voteForFeatureRequest(id: string): Promise<FeatureRequest> {
    const response = await axios.post(`${API_URL}/feature-requests/${id}/vote`);
    return response.data;
  }

  async removeVoteForFeatureRequest(id: string): Promise<FeatureRequest> {
    const response = await axios.post(`${API_URL}/feature-requests/${id}/unvote`);
    return response.data;
  }
}

export default new FeatureRequestService(); 