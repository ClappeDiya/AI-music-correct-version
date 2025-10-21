import { DeviceAPI, BiometricData, DeviceDiagnostics } from "./index";

export class GarminAPI implements DeviceAPI {
  private readonly API_KEY = process.env.NEXT_PUBLIC_GARMIN_API_KEY;
  private readonly BASE_URL = "https://api.garmin.com/wellness-api/rest";
  private accessToken: string | null = null;

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.API_KEY!,
          grant_type: "authorization_code",
          // Add other required OAuth parameters
        }),
      });

      if (!response.ok) throw new Error("Authentication failed");

      const data = await response.json();
      this.accessToken = data.access_token;
    } catch (error) {
      console.error("Garmin authentication error:", error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
  ) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expired, re-authenticate and retry
      await this.authenticate();
      return this.makeAuthenticatedRequest(endpoint, options);
    }

    return response;
  }

  async connect(): Promise<void> {
    await this.authenticate();
  }

  async disconnect(): Promise<void> {
    if (this.accessToken) {
      await this.makeAuthenticatedRequest("/oauth/revoke", {
        method: "POST",
        body: new URLSearchParams({
          token: this.accessToken,
        }),
      });
      this.accessToken = null;
    }
  }

  async getBiometricData(): Promise<BiometricData> {
    const [heartRate, stress, activity] = await Promise.all([
      this.makeAuthenticatedRequest("/heart-rate/latest"),
      this.makeAuthenticatedRequest("/stress/latest"),
      this.makeAuthenticatedRequest("/activity/latest"),
    ]);

    const [heartRateData, stressData, activityData] = await Promise.all([
      heartRate.json(),
      stress.json(),
      activity.json(),
    ]);

    // Process and normalize the data
    const energyLevel = this.calculateEnergyLevel(heartRateData, activityData);
    const mood = this.inferMood(heartRateData, stressData, activityData);

    return {
      heartRate: heartRateData.value,
      stressLevel: stressData.value,
      energyLevel,
      movement: activityData.movementLevel,
      mood,
      deviceBattery: activityData.deviceBattery,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getDiagnostics(): Promise<DeviceDiagnostics> {
    const response = await this.makeAuthenticatedRequest("/device/diagnostics");
    const data = await response.json();

    return {
      batteryLevel: data.batteryLevel,
      firmwareVersion: data.firmwareVersion,
      lastSyncTime: data.lastSyncTime,
      connectionStrength: data.connectionStrength,
      sensorStatus: {
        heartRate: data.sensors.heartRate.working,
        accelerometer: data.sensors.accelerometer.working,
        gyroscope: data.sensors.gyroscope.working,
      },
      errors: data.errors || [],
    };
  }

  private calculateEnergyLevel(heartRate: any, activity: any): number {
    // Sophisticated algorithm to calculate energy level
    const hrContribution = (heartRate.value / 180) * 50; // HR contributes 50%
    const activityContribution = (activity.movementLevel / 100) * 50; // Activity contributes 50%
    return Math.min(100, hrContribution + activityContribution);
  }

  private inferMood(heartRate: any, stress: any, activity: any): string {
    // Sophisticated mood inference algorithm
    const hrNormalized = heartRate.value / 180;
    const stressNormalized = stress.value / 100;
    const activityNormalized = activity.movementLevel / 100;

    // Calculate mood scores
    const energeticScore =
      (hrNormalized * 0.4 + activityNormalized * 0.6) * 100;
    const stressScore = stressNormalized * 100;
    const calmScore =
      ((1 - hrNormalized) * 0.3 + (1 - stressNormalized) * 0.7) * 100;
    const focusedScore =
      ((1 - stressNormalized) * 0.6 + activityNormalized * 0.4) * 100;

    // Find the highest scoring mood
    const moodScores = [
      { mood: "energetic", score: energeticScore },
      { mood: "stressed", score: stressScore },
      { mood: "calm", score: calmScore },
      { mood: "focused", score: focusedScore },
    ];

    return moodScores.reduce((prev, current) =>
      current.score > prev.score ? current : prev,
    ).mood;
  }
}
