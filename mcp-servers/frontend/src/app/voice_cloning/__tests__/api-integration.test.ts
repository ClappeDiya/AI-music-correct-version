import { voiceCloning } from "@/services/api/voice_cloning";

describe("Voice Cloning API Integration", () => {
  describe("Voice Models", () => {
    it("should fetch voice models", async () => {
      const response = await voiceCloning.getVoiceModels();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should create a voice model", async () => {
      const modelData = {
        name: "Test Model",
        description: "Test Description",
        supported_languages: ["en-US"],
      };

      const response = await voiceCloning.createVoiceModel(modelData);
      expect(response.data.id).toBeDefined();
    });
  });

  describe("Voice Samples", () => {
    it("should fetch voice samples", async () => {
      const response = await voiceCloning.getVoiceSamples();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should upload a voice sample", async () => {
      const file = new File(["test"], "test.wav", { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", file);

      const response = await voiceCloning.uploadVoiceSample(formData);
      expect(response.data.id).toBeDefined();
    });
  });

  describe("Analysis", () => {
    it("should start voice analysis", async () => {
      const response = await voiceCloning.startAnalysis(1);
      expect(response.data.id).toBeDefined();
    });

    it("should fetch analysis status", async () => {
      const response = await voiceCloning.getAnalysisStatus(1);
      expect(response.data.status).toBeDefined();
    });
  });
});
