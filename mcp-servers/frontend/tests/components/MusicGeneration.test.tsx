import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MusicGenerationForm from "@/components/MusicGeneration/MusicGenerationForm";
import { MusicVisualization } from "@/components/MusicGeneration/MusicVisualization";
import { AdvancedControls } from "@/components/MusicGeneration/AdvancedControls";
import { useAuth } from "@/hooks/useAuth";
import { generateMusic } from "@/services/musicGenerationService";

// Mock the auth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", subscription: "basic" },
    isAuthenticated: true,
  }),
}));

// Mock the music generation service
vi.mock("@/services/musicGenerationService", () => ({
  generateMusic: vi.fn(),
}));

describe("Music Generation Components", () => {
  describe("MusicGenerationForm", () => {
    it("renders form with all required fields", () => {
      render(<MusicGenerationForm onSubmit={() => {}} />);

      expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /generate/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /advanced/i }),
      ).toBeInTheDocument();
    });

    it("handles form submission with user context", async () => {
      const mockSubmit = vi.fn();
      render(<MusicGenerationForm onSubmit={mockSubmit} />);

      const promptInput = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptInput, {
        target: { value: "Create a jazz melody" },
      });

      const submitButton = screen.getByRole("button", { name: /generate/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt_text: "Create a jazz melody",
            user_id: "test-user-id",
          }),
        );
      });
    });

    it("validates required fields", async () => {
      render(<MusicGenerationForm onSubmit={() => {}} />);

      const submitButton = screen.getByRole("button", { name: /generate/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/prompt is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("AdvancedControls", () => {
    it("renders all parameter controls", () => {
      const mockParams = {
        tempo: 120,
        complexity: "medium",
        emotionalTone: "happy",
      };

      render(
        <AdvancedControls
          parameters={mockParams}
          onParameterChange={() => {}}
        />,
      );

      expect(screen.getByLabelText(/tempo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/complexity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emotional tone/i)).toBeInTheDocument();
    });

    it("updates parameters on user interaction", async () => {
      const mockChange = vi.fn();
      render(
        <AdvancedControls parameters={{}} onParameterChange={mockChange} />,
      );

      const tempoSlider = screen.getByLabelText(/tempo/i);
      fireEvent.change(tempoSlider, { target: { value: 140 } });

      await waitFor(() => {
        expect(mockChange).toHaveBeenCalledWith(
          expect.objectContaining({ tempo: 140 }),
        );
      });
    });
  });

  describe("MusicVisualization", () => {
    it("renders visualization components when data is provided", () => {
      const mockTrack = {
        audio_url: "test.mp3",
        waveform_data: {},
        notation_data: {},
      };

      render(<MusicVisualization track={mockTrack} />);

      expect(screen.getByTestId("waveform-visualizer")).toBeInTheDocument();
      expect(screen.getByTestId("notation-visualizer")).toBeInTheDocument();
    });

    it("shows loading state while processing", () => {
      render(<MusicVisualization track={null} loading={true} />);
      expect(screen.getByTestId("visualization-loading")).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("handles complete music generation flow", async () => {
      const mockGeneratedTrack = {
        id: "test-track",
        audio_url: "test.mp3",
        waveform_data: {},
        notation_data: {},
      };

      generateMusic.mockResolvedValueOnce(mockGeneratedTrack);

      render(
        <>
          <MusicGenerationForm onSubmit={() => {}} />
          <MusicVisualization track={null} />
        </>,
      );

      // Fill and submit form
      const promptInput = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptInput, { target: { value: "Test melody" } });

      // Open advanced controls
      const advancedTab = screen.getByRole("tab", { name: /advanced/i });
      fireEvent.click(advancedTab);

      // Adjust parameters
      const tempoSlider = screen.getByLabelText(/tempo/i);
      fireEvent.change(tempoSlider, { target: { value: 140 } });

      // Submit
      const submitButton = screen.getByRole("button", { name: /generate/i });
      fireEvent.click(submitButton);

      // Verify loading state
      expect(screen.getByTestId("visualization-loading")).toBeInTheDocument();

      // Verify final state
      await waitFor(() => {
        expect(generateMusic).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt_text: "Test melody",
            user_id: "test-user-id",
            parameters: expect.objectContaining({ tempo: 140 }),
          }),
        );
      });
    });

    it("handles errors gracefully", async () => {
      generateMusic.mockRejectedValueOnce(new Error("API Error"));

      render(
        <>
          <MusicGenerationForm onSubmit={() => {}} />
          <MusicVisualization track={null} />
        </>,
      );

      const promptInput = screen.getByLabelText(/prompt/i);
      fireEvent.change(promptInput, { target: { value: "Test melody" } });

      const submitButton = screen.getByRole("button", { name: /generate/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });
  });
});
