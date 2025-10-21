import { Page } from "@playwright/test";

export async function mockVoiceCommand(page: Page, command: string) {
  // Mock the Web Speech API
  await page.evaluate(() => {
    // @ts-ignore - Mock SpeechRecognition
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const mockSpeechRecognition = class {
      continuous = false;
      interimResults = false;
      onstart: (() => void) | null = null;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        if (this.onstart) this.onstart();
      }

      stop() {
        if (this.onend) this.onend();
      }

      // Store the mock instance for triggering results
      static instance: any = null;

      constructor() {
        mockSpeechRecognition.instance = this;
      }
    };

    // @ts-ignore - Replace real SpeechRecognition with mock
    window.SpeechRecognition = mockSpeechRecognition;
  });

  // Trigger voice command
  await page.evaluate((text) => {
    // @ts-ignore - Access mock instance
    const recognition = window.SpeechRecognition.instance;
    if (recognition && recognition.onresult) {
      // Create mock result event
      const event = {
        results: [
          [
            {
              transcript: text,
              confidence: 0.9,
            },
          ],
        ],
        resultIndex: 0,
      };
      recognition.onresult(event);
    }
  }, command);
}
