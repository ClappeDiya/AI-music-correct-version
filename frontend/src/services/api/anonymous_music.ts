// Anonymous Music Generation API Service
// Allows users to try music generation without authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnonymousMusicParams {
  genre: string;
  mood: string;
  duration: number;
  prompt?: string;
}

export interface GeneratedTrack {
  id: string;
  url: string;
  duration: number;
  waveform: number[];
  title: string;
  genre: string;
  mood: string;
  format: string;
}

export interface GenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  track?: GeneratedTrack;
  message?: string;
  error?: string;
}

export interface GenerationResponse {
  requestId: string;
  status: string;
  message: string;
  statusUrl: string;
}

/**
 * Generate music without authentication
 * Rate limited to 5 requests per hour per IP
 */
export async function generateAnonymousMusic(
  params: AnonymousMusicParams
): Promise<GeneratedTrack> {
  try {
    // Step 1: Start generation
    const response = await fetch(
      `${API_URL}/api/ai-music-requests/anonymous/generate/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || 'Failed to start music generation'
      );
    }

    const data: GenerationResponse = await response.json();

    // Step 2: Poll for completion
    return await pollForCompletion(data.requestId);
  } catch (error: any) {
    console.error('Error generating anonymous music:', error);
    throw error;
  }
}

/**
 * Poll the backend for music generation completion
 */
async function pollForCompletion(requestId: string): Promise<GeneratedTrack> {
  const maxAttempts = 60; // 3 minutes with 3-second intervals
  const pollInterval = 3000; // 3 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(
        `${API_URL}/api/ai-music-requests/anonymous/music/${requestId}/status/`
      );

      if (!response.ok) {
        throw new Error('Failed to check generation status');
      }

      const data: GenerationStatus = await response.json();

      if (data.status === 'completed' && data.track) {
        return data.track;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Music generation failed');
      }

      // Still processing, wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      attempts++;
    } catch (error: any) {
      console.error('Error polling status:', error);
      throw error;
    }
  }

  throw new Error('Generation timeout. Please try again.');
}

/**
 * Get the status of an anonymous music generation request
 */
export async function getAnonymousMusicStatus(
  requestId: string
): Promise<GenerationStatus> {
  try {
    const response = await fetch(
      `${API_URL}/api/ai-music-requests/anonymous/music/${requestId}/status/`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch generation status');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching music status:', error);
    throw error;
  }
}

/**
 * Check if user can generate more tracks (rate limit check)
 * This is done client-side as a courtesy - backend enforces the limit
 */
export function checkAnonymousQuota(): {
  canGenerate: boolean;
  remaining: number;
  resetTime: Date | null;
} {
  const STORAGE_KEY = 'anonymous_music_generations';
  const RATE_LIMIT = 5; // 5 per hour
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const generations: number[] = stored ? JSON.parse(stored) : [];

    // Remove timestamps older than 1 hour
    const now = Date.now();
    const recentGenerations = generations.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    // Calculate when quota resets
    const oldestTimestamp = recentGenerations[0];
    const resetTime = oldestTimestamp
      ? new Date(oldestTimestamp + WINDOW_MS)
      : null;

    return {
      canGenerate: recentGenerations.length < RATE_LIMIT,
      remaining: Math.max(0, RATE_LIMIT - recentGenerations.length),
      resetTime,
    };
  } catch (error) {
    console.error('Error checking anonymous quota:', error);
    // On error, allow generation (backend will enforce limit)
    return {
      canGenerate: true,
      remaining: RATE_LIMIT,
      resetTime: null,
    };
  }
}

/**
 * Record a generation in local storage for client-side quota tracking
 */
export function recordAnonymousGeneration(): void {
  const STORAGE_KEY = 'anonymous_music_generations';
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const generations: number[] = stored ? JSON.parse(stored) : [];

    // Add current timestamp
    const now = Date.now();
    generations.push(now);

    // Remove timestamps older than 1 hour
    const recentGenerations = generations.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentGenerations));
  } catch (error) {
    console.error('Error recording anonymous generation:', error);
  }
}
