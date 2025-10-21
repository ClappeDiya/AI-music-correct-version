import {
  Language,
  LLMProvider,
  LyricInfluencer,
  LyricPrompt,
  LyricDraft,
  LyricEdit,
  FinalLyrics,
  LyricTimeline,
  LyricVrArSettings,
  LyricSignature,
  LyricAdaptiveFeedback,
} from "@/types/LyricsGeneration";

const BASE_URL = "/api/lyrics-generation";

// Generic CRUD functions
async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

async function post<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

async function put<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

async function del(endpoint: string): Promise<void> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Network response was not ok");
}

// Language API
export const languageApi = {
  getAll: () => get<Language[]>("/languages/"),
  getById: (id: number) => get<Language>(`/languages/${id}/`),
  create: (data: Omit<Language, "id" | "created_at">) =>
    post<Language>("/languages/", data),
  update: (id: number, data: Partial<Language>) =>
    put<Language>(`/languages/${id}/`, data),
  delete: (id: number) => del(`/languages/${id}/`),
};

// LLM Provider API
export const llmProviderApi = {
  getAll: () => get<LLMProvider[]>("/llm-providers/"),
  getById: (id: number) => get<LLMProvider>(`/llm-providers/${id}/`),
  create: (data: Omit<LLMProvider, "id" | "created_at" | "updated_at">) =>
    post<LLMProvider>("/llm-providers/", data),
  update: (id: number, data: Partial<LLMProvider>) =>
    put<LLMProvider>(`/llm-providers/${id}/`, data),
  delete: (id: number) => del(`/llm-providers/${id}/`),
};

// Lyric Influencer API
export const lyricInfluencerApi = {
  getAll: () => get<LyricInfluencer[]>("/lyric-influencers/"),
  getById: (id: number) => get<LyricInfluencer>(`/lyric-influencers/${id}/`),
  create: (data: Omit<LyricInfluencer, "id" | "created_at">) =>
    post<LyricInfluencer>("/lyric-influencers/", data),
  update: (id: number, data: Partial<LyricInfluencer>) =>
    put<LyricInfluencer>(`/lyric-influencers/${id}/`, data),
  delete: (id: number) => del(`/lyric-influencers/${id}/`),
};

// Lyric Prompt API
export const lyricPromptApi = {
  getAll: () => get<LyricPrompt[]>("/lyric-prompts/"),
  getById: (id: number) => get<LyricPrompt>(`/lyric-prompts/${id}/`),
  create: (data: Omit<LyricPrompt, "id" | "created_at" | "user">) =>
    post<LyricPrompt>("/lyric-prompts/", data),
  update: (id: number, data: Partial<LyricPrompt>) =>
    put<LyricPrompt>(`/lyric-prompts/${id}/`, data),
  delete: (id: number) => del(`/lyric-prompts/${id}/`),
};

// Lyric Draft API
export const lyricDraftApi = {
  getAll: () => get<LyricDraft[]>("/lyric-drafts/"),
  getById: (id: number) => get<LyricDraft>(`/lyric-drafts/${id}/`),
  create: (data: Omit<LyricDraft, "id" | "created_at">) =>
    post<LyricDraft>("/lyric-drafts/", data),
  update: (id: number, data: Partial<LyricDraft>) =>
    put<LyricDraft>(`/lyric-drafts/${id}/`, data),
  delete: (id: number) => del(`/lyric-drafts/${id}/`),
};

// Final Lyrics API
export const finalLyricsApi = {
  getAll: () => get<FinalLyrics[]>("/final-lyrics/"),
  getById: (id: number) => get<FinalLyrics>(`/final-lyrics/${id}/`),
  create: (data: Omit<FinalLyrics, "id" | "created_at" | "user">) =>
    post<FinalLyrics>("/final-lyrics/", data),
  update: (id: number, data: Partial<FinalLyrics>) =>
    put<FinalLyrics>(`/final-lyrics/${id}/`, data),
  delete: (id: number) => del(`/final-lyrics/${id}/`),
};

// Lyric Timeline API
export const lyricTimelineApi = {
  getAll: () => get<LyricTimeline[]>("/lyric-timelines/"),
  getById: (id: number) => get<LyricTimeline>(`/lyric-timelines/${id}/`),
  create: (data: Omit<LyricTimeline, "id" | "created_at">) =>
    post<LyricTimeline>("/lyric-timelines/", data),
  update: (id: number, data: Partial<LyricTimeline>) =>
    put<LyricTimeline>(`/lyric-timelines/${id}/`, data),
  delete: (id: number) => del(`/lyric-timelines/${id}/`),
};

// VR/AR Settings API
export const lyricVrArSettingsApi = {
  getAll: () => get<LyricVrArSettings[]>("/lyric-vr-ar-settings/"),
  getById: (id: number) =>
    get<LyricVrArSettings>(`/lyric-vr-ar-settings/${id}/`),
  create: (data: Omit<LyricVrArSettings, "id" | "created_at">) =>
    post<LyricVrArSettings>("/lyric-vr-ar-settings/", data),
  update: (id: number, data: Partial<LyricVrArSettings>) =>
    put<LyricVrArSettings>(`/lyric-vr-ar-settings/${id}/`, data),
  delete: (id: number) => del(`/lyric-vr-ar-settings/${id}/`),
};

// Lyric Signature API
export const lyricSignatureApi = {
  getAll: () => get<LyricSignature[]>("/lyric-signatures/"),
  getById: (id: number) => get<LyricSignature>(`/lyric-signatures/${id}/`),
  create: (data: Omit<LyricSignature, "id" | "created_at">) =>
    post<LyricSignature>("/lyric-signatures/", data),
  update: (id: number, data: Partial<LyricSignature>) =>
    put<LyricSignature>(`/lyric-signatures/${id}/`, data),
  delete: (id: number) => del(`/lyric-signatures/${id}/`),
};

// Adaptive Feedback API
export const lyricAdaptiveFeedbackApi = {
  getAll: () => get<LyricAdaptiveFeedback[]>("/lyric-adaptive-feedback/"),
  getById: (id: number) =>
    get<LyricAdaptiveFeedback>(`/lyric-adaptive-feedback/${id}/`),
  create: (data: Omit<LyricAdaptiveFeedback, "id" | "created_at">) =>
    post<LyricAdaptiveFeedback>("/lyric-adaptive-feedback/", data),
  update: (id: number, data: Partial<LyricAdaptiveFeedback>) =>
    put<LyricAdaptiveFeedback>(`/lyric-adaptive-feedback/${id}/`, data),
  delete: (id: number) => del(`/lyric-adaptive-feedback/${id}/`),
};
