import { openDB, DBSchema, IDBPDatabase } from "idb";
import { BiometricData, DeviceDiagnostics } from "../deviceApi";

interface BiometricDBSchema extends DBSchema {
  biometricData: {
    key: string;
    value: BiometricData & { timestamp: number };
  };
  deviceDiagnostics: {
    key: string;
    value: DeviceDiagnostics & { timestamp: number };
  };
}

export class BiometricCache {
  private db: IDBPDatabase<BiometricDBSchema> | null = null;
  private readonly DB_NAME = "biometric-cache";
  private readonly DATA_STORE = "biometricData";
  private readonly DIAGNOSTICS_STORE = "deviceDiagnostics";
  private readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  private async initDB() {
    if (!this.db) {
      this.db = await openDB<BiometricDBSchema>(this.DB_NAME, 1, {
        upgrade(db) {
          db.createObjectStore("biometricData", { keyPath: "timestamp" });
          db.createObjectStore("deviceDiagnostics", { keyPath: "timestamp" });
        },
      });
    }
  }

  async cacheBiometricData(data: BiometricData): Promise<void> {
    await this.initDB();
    const timestamp = Date.now();
    await this.db!.add(this.DATA_STORE, {
      ...data,
      timestamp,
    });

    // Clean up old data
    await this.cleanup();
  }

  async getCachedBiometricData(maxAge?: number): Promise<BiometricData[]> {
    await this.initDB();
    const cutoff = Date.now() - (maxAge || this.MAX_AGE);
    const tx = this.db!.transaction(this.DATA_STORE, "readonly");
    const store = tx.objectStore(this.DATA_STORE);
    const data = await store.getAll();

    return data
      .filter((item) => item.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async cacheDiagnostics(data: DeviceDiagnostics): Promise<void> {
    await this.initDB();
    const timestamp = Date.now();
    await this.db!.add(this.DIAGNOSTICS_STORE, {
      ...data,
      timestamp,
    });
  }

  async getCachedDiagnostics(maxAge?: number): Promise<DeviceDiagnostics[]> {
    await this.initDB();
    const cutoff = Date.now() - (maxAge || this.MAX_AGE);
    const tx = this.db!.transaction(this.DIAGNOSTICS_STORE, "readonly");
    const store = tx.objectStore(this.DIAGNOSTICS_STORE);
    const data = await store.getAll();

    return data
      .filter((item) => item.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async exportData(startDate?: Date, endDate?: Date): Promise<Blob> {
    await this.initDB();
    const [biometricData, diagnosticsData] = await Promise.all([
      this.getCachedBiometricData(),
      this.getCachedDiagnostics(),
    ]);

    const filteredBiometricData = this.filterDataByDateRange(
      biometricData,
      startDate,
      endDate,
    );
    const filteredDiagnosticsData = this.filterDataByDateRange(
      diagnosticsData,
      startDate,
      endDate,
    );

    const exportData = {
      biometricData: filteredBiometricData,
      diagnosticsData: filteredDiagnosticsData,
      exportDate: new Date().toISOString(),
      dateRange: {
        start: startDate?.toISOString() || "beginning",
        end: endDate?.toISOString() || "end",
      },
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
  }

  private async cleanup(): Promise<void> {
    const cutoff = Date.now() - this.MAX_AGE;
    const tx = this.db!.transaction(
      [this.DATA_STORE, this.DIAGNOSTICS_STORE],
      "readwrite",
    );

    await Promise.all([
      this.cleanupStore(tx.objectStore(this.DATA_STORE), cutoff),
      this.cleanupStore(tx.objectStore(this.DIAGNOSTICS_STORE), cutoff),
    ]);
  }

  private async cleanupStore(store: any, cutoff: number): Promise<void> {
    let cursor = await store.openCursor();

    while (cursor) {
      if (cursor.value.timestamp < cutoff) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  private filterDataByDateRange<T extends { timestamp: number }>(
    data: T[],
    startDate?: Date,
    endDate?: Date,
  ): T[] {
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const afterStart = !startDate || itemDate >= startDate;
      const beforeEnd = !endDate || itemDate <= endDate;
      return afterStart && beforeEnd;
    });
  }
}
