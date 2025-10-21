import {
  MusicTradition,
  CrossCulturalBlend,
  MultilingualLyrics,
} from "./types";

export const traditionApi = {
  // Music Traditions
  async getTraditions(): Promise<MusicTradition[]> {
    const response = await fetch("/api/music_traditions/");
    if (!response.ok) throw new Error("Failed to fetch traditions");
    return response.json();
  },

  async getTraditionParameters(
    traditionId: string,
    sectionType: string = "full",
  ): Promise<any> {
    const response = await fetch(
      `/api/music_traditions/${traditionId}/parameters/?section_type=${sectionType}`,
    );
    if (!response.ok) throw new Error("Failed to fetch parameters");
    return response.json();
  },

  // Cultural Blends
  async createBlend(
    data: Partial<CrossCulturalBlend>,
  ): Promise<CrossCulturalBlend> {
    const response = await fetch("/api/cultural-blends/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create blend");
    return response.json();
  },

  async addTraditionToBlend(
    blendId: string,
    traditionId: string,
    weight: number,
    sectionOrder?: number,
  ): Promise<any> {
    const response = await fetch(
      `/api/cultural-blends/${blendId}/add_tradition/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradition: traditionId,
          weight,
          section_order: sectionOrder,
        }),
      },
    );
    if (!response.ok) throw new Error("Failed to add tradition to blend");
    return response.json();
  },

  async generateBlendParameters(
    blendId: string,
    sectionType: string = "full",
  ): Promise<any> {
    const response = await fetch(
      `/api/cultural-blends/${blendId}/generate_parameters/?section_type=${sectionType}`,
      {
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Failed to generate parameters");
    return response.json();
  },

  // Multilingual Lyrics
  async createLyrics(data: {
    track: string;
    primary_language: string;
    translation_languages: string[];
    original_lyrics?: string;
  }): Promise<MultilingualLyrics> {
    const response = await fetch("/api/multilingual-lyrics/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create lyrics");
    return response.json();
  },

  async regenerateTranslations(lyricsId: string): Promise<MultilingualLyrics> {
    const response = await fetch(
      `/api/multilingual-lyrics/${lyricsId}/regenerate_translations/`,
      {
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Failed to regenerate translations");
    return response.json();
  },
};
