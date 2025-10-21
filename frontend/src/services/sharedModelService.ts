import axios from "axios";
import {
  SharedModelGroup,
  SharedModelMember,
  TrainingContribution,
  ModelTrainingJob,
  Role,
} from "../types/sharedModel";

const API_BASE = "/api/v1";

export const sharedModelService = {
  // Group Management
  async getGroups(): Promise<SharedModelGroup[]> {
    const response = await axios.get(`${API_BASE}/shared-models/`);
    return response.data;
  },

  async getGroupDetails(groupId: number): Promise<SharedModelGroup> {
    const response = await axios.get(`${API_BASE}/shared-models/${groupId}/`);
    return response.data;
  },

  async createGroup(
    data: Partial<SharedModelGroup>,
  ): Promise<SharedModelGroup> {
    const response = await axios.post(`${API_BASE}/shared-models/`, data);
    return response.data;
  },

  async updateGroup(
    groupId: number,
    data: Partial<SharedModelGroup>,
  ): Promise<SharedModelGroup> {
    const response = await axios.patch(
      `${API_BASE}/shared-models/${groupId}/`,
      data,
    );
    return response.data;
  },

  // Member Management
  async inviteMember(
    groupId: number,
    userId: number,
    role: Role,
  ): Promise<SharedModelMember> {
    const response = await axios.post(
      `${API_BASE}/shared-models/${groupId}/invite_member/`,
      {
        user_id: userId,
        role,
      },
    );
    return response.data;
  },

  async updateMemberRole(
    memberId: number,
    role: Role,
  ): Promise<SharedModelMember> {
    const response = await axios.patch(
      `${API_BASE}/group-members/${memberId}/`,
      { role },
    );
    return response.data;
  },

  // Training Contributions
  async contributeTrack(
    groupId: number,
    compositionId: number,
  ): Promise<TrainingContribution> {
    const response = await axios.post(
      `${API_BASE}/shared-models/${groupId}/contribute_track/`,
      {
        composition_id: compositionId,
      },
    );
    return response.data;
  },

  async reviewContribution(
    contributionId: number,
    status: "approved" | "rejected",
    notes: string,
  ): Promise<TrainingContribution> {
    const response = await axios.post(
      `${API_BASE}/training-contributions/${contributionId}/review/`,
      {
        status,
        review_notes: notes,
      },
    );
    return response.data;
  },

  // Training Jobs
  async startTraining(groupId: number): Promise<ModelTrainingJob> {
    const response = await axios.post(
      `${API_BASE}/shared-models/${groupId}/start_training/`,
    );
    return response.data;
  },

  async getTrainingJob(jobId: number): Promise<ModelTrainingJob> {
    const response = await axios.get(`${API_BASE}/training-jobs/${jobId}/`);
    return response.data;
  },

  // WebSocket subscription for real-time updates
  subscribeToUpdates(
    groupId: number,
    callbacks: {
      onMemberUpdate?: (member: SharedModelMember) => void;
      onContributionUpdate?: (contribution: TrainingContribution) => void;
      onTrainingUpdate?: (job: ModelTrainingJob) => void;
    },
  ): WebSocket {
    const ws = new WebSocket(
      `ws://${window.location.host}/ws/shared-model/${groupId}/`,
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "member_update":
          callbacks.onMemberUpdate?.(data.member);
          break;
        case "contribution_update":
          callbacks.onContributionUpdate?.(data.contribution);
          break;
        case "training_update":
          callbacks.onTrainingUpdate?.(data.job);
          break;
      }
    };

    return ws;
  },
};
