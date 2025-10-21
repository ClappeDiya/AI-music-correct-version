import { api } from "../api";

const BASE_URL = "/api/future_capabilities";

// Generic CRUD operations
const createCrudOperations = <T>(endpoint: string) => ({
  list: () => api.get<T[]>(`${BASE_URL}/${endpoint}/`),
  get: (id: number) => api.get<T>(`${BASE_URL}/${endpoint}/${id}/`),
  create: (data: Partial<T>) => api.post<T>(`${BASE_URL}/${endpoint}/`, data),
  update: (id: number, data: Partial<T>) =>
    api.put<T>(`${BASE_URL}/${endpoint}/${id}/`, data),
  delete: (id: number) => api.delete(`${BASE_URL}/${endpoint}/${id}/`),
});

// API endpoints for each module
export const futureCapabilitiesApi = {
  vrEnvironments: createCrudOperations("vr-environment-configs"),
  collaborationSessions: {
    ...createCrudOperations("collaboration-sessions"),
    activate: (id: number) =>
      api.post(`${BASE_URL}/collaboration-sessions/${id}/activate/`),
    deactivate: (id: number) =>
      api.post(`${BASE_URL}/collaboration-sessions/${id}/deactivate/`),
  },
  activityLogs: createCrudOperations("collaboration-activity-logs"),
  aiPlugins: createCrudOperations("ai-plugin-registry"),
  userStyles: createCrudOperations("user-style-profiles"),
  deviceIntegrations: createCrudOperations("device-integration-configs"),
  biofeedbackLogs: createCrudOperations("biofeedback-data-logs"),
  thirdPartyIntegrations: createCrudOperations("third-party-integrations"),
  miniApps: createCrudOperations("mini-app-registry"),
  userFeedback: createCrudOperations("user-feedback-logs"),
  featureRoadmap: createCrudOperations("feature-roadmap"),
  microservices: createCrudOperations("microservice-registry"),
  microfluidicInstruments: createCrudOperations(
    "microfluidic-instrument-configs",
  ),
  dimensionalityModels: createCrudOperations("dimensionality-models"),
  aiAgentPartnerships: createCrudOperations("ai-agent-partnerships"),
  synestheticMappings: createCrudOperations("synesthetic-mappings"),
  semanticLayers: createCrudOperations("semantic-layers"),
  pipelineEvolution: createCrudOperations("pipeline-evolution-logs"),
  interstellarLatency: createCrudOperations("interstellar-latency-configs"),
};
