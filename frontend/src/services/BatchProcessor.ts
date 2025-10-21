import { VoiceApplicationConfig } from "./api/voice-application";

export interface BatchProcessingJob {
  id: string;
  configs: VoiceApplicationConfig[];
  progress: number;
  status: "queued" | "processing" | "completed" | "failed";
  results: Array<{
    config: VoiceApplicationConfig;
    trackId?: number;
    error?: string;
  }>;
}

export class BatchProcessor {
  private jobs: Map<string, BatchProcessingJob> = new Map();
  private maxConcurrent = 3;
  private processingCount = 0;

  async addJob(configs: VoiceApplicationConfig[]): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: BatchProcessingJob = {
      id: jobId,
      configs,
      progress: 0,
      status: "queued",
      results: configs.map((config) => ({ config })),
    };

    this.jobs.set(jobId, job);
    this.processNextJob();
    return jobId;
  }

  private async processNextJob() {
    if (this.processingCount >= this.maxConcurrent) return;

    const job = Array.from(this.jobs.values()).find(
      (j) => j.status === "queued",
    );
    if (!job) return;

    this.processingCount++;
    job.status = "processing";

    try {
      for (let i = 0; i < job.configs.length; i++) {
        const config = job.configs[i];
        try {
          // Process individual config
          // Implementation details...
          job.results[i].trackId = 123; // Placeholder
        } catch (error) {
          job.results[i].error =
            error instanceof Error ? error.message : "Unknown error";
        }
        job.progress = ((i + 1) / job.configs.length) * 100;
      }
      job.status = "completed";
    } catch (error) {
      job.status = "failed";
    }

    this.processingCount--;
    this.processNextJob();
  }

  getJobStatus(jobId: string): BatchProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === "queued") {
      this.jobs.delete(jobId);
      return true;
    }
    return false;
  }
}
