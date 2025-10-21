import { GarminAPI } from "./garmin";
import { AppleHealthAPI } from "./apple";
import { FitbitAPI } from "./fitbit";

export type DeviceType = "garmin" | "apple" | "fitbit";

export interface DeviceAPI {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getBiometricData(): Promise<BiometricData>;
  getDiagnostics(): Promise<DeviceDiagnostics>;
}

export interface BiometricData {
  heartRate: number;
  stressLevel: number;
  energyLevel: number;
  movement: number;
  mood: string;
  deviceBattery: number;
  lastUpdated: string;
}

export interface DeviceDiagnostics {
  batteryLevel: number;
  firmwareVersion: string;
  lastSyncTime: string;
  connectionStrength: number;
  sensorStatus: {
    heartRate: boolean;
    accelerometer: boolean;
    gyroscope: boolean;
  };
  errors: string[];
}

class DeviceAPIFactory {
  static createAPI(type: DeviceType): DeviceAPI {
    switch (type) {
      case "garmin":
        return new GarminAPI();
      case "apple":
        return new AppleHealthAPI();
      case "fitbit":
        return new FitbitAPI();
      default:
        throw new Error(`Unsupported device type: ${type}`);
    }
  }
}

export { DeviceAPIFactory };
