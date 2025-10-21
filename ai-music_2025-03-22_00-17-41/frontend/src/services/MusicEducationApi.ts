export interface VideoWatchHistoryRequest {
  lessonId: number;
  sectionId: number;
  progress: number;
  timestamp: number;
}

export interface VideoNoteRequest {
  lessonId: number;
  sectionId: number;
  timestamp: number;
  text: string;
}

export interface MaterialDownloadRequest {
  lessonId: number;
  materialId: string;
}

class MusicEducationApi {
  // ... existing code ...

  // Video Watch History
  async updateWatchHistory(data: VideoWatchHistoryRequest): Promise<void> {
    await this.post("/watch-history", data);
  }

  async getWatchHistory(lessonId: number): Promise<WatchHistory> {
    const response = await this.get(`/watch-history/${lessonId}`);
    return response.data;
  }

  // Video Notes
  async addVideoNote(data: VideoNoteRequest): Promise<VideoNote> {
    const response = await this.post("/video-notes", data);
    return response.data;
  }

  async getVideoNotes(lessonId: number): Promise<VideoNote[]> {
    const response = await this.get(`/video-notes/${lessonId}`);
    return response.data;
  }

  async deleteVideoNote(noteId: string): Promise<void> {
    await this.delete(`/video-notes/${noteId}`);
  }

  // Materials
  async downloadMaterial(
    data: MaterialDownloadRequest,
  ): Promise<{ downloadUrl: string }> {
    const response = await this.post("/materials/download", data);
    return response.data;
  }

  async getMaterialsForLesson(
    lessonId: number,
  ): Promise<DownloadableMaterial[]> {
    const response = await this.get(`/materials/${lessonId}`);
    return response.data;
  }

  // Video Quality
  async getAvailableQualities(
    videoUrl: string,
  ): Promise<{ quality: string; url: string }[]> {
    const response = await this.get(
      `/video/qualities?url=${encodeURIComponent(videoUrl)}`,
    );
    return response.data;
  }

  async requestOfflineDownload(
    videoUrl: string,
    quality: string,
  ): Promise<{ downloadId: string }> {
    const response = await this.post("/video/offline-download", {
      videoUrl,
      quality,
    });
    return response.data;
  }

  async getOfflineDownloadStatus(downloadId: string): Promise<{
    status: "pending" | "downloading" | "completed" | "failed";
    progress?: number;
    url?: string;
  }> {
    const response = await this.get(`/video/offline-download/${downloadId}`);
    return response.data;
  }

  // Video Analytics
  async updateVideoAnalytics(data: {
    lessonId: number;
    sectionId: number;
    event: "play" | "pause" | "seek" | "complete";
    timestamp: number;
    duration?: number;
  }): Promise<void> {
    await this.post("/video/analytics", data);
  }

  async getVideoAnalytics(lessonId: number): Promise<{
    totalWatchTime: number;
    completionRate: number;
    mostWatchedSegments: { start: number; end: number; count: number }[];
    averageEngagement: number;
  }> {
    const response = await this.get(`/video/analytics/${lessonId}`);
    return response.data;
  }
}
