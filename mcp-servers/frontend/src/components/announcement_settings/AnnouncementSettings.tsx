import React, { useState } from "react";
import { announcementService } from "../../services/announcementService";
import styles from "./AnnouncementSettings.module.css";

interface AnnouncementSettingsProps {
  sessionId: number;
  initialSettings: {
    enable_announcements: boolean;
    voice_style: string;
    announcement_frequency: string;
  };
  onSettingsUpdate?: () => void;
}

export const AnnouncementSettings: React.FC<AnnouncementSettingsProps> = ({
  sessionId,
  initialSettings,
  onSettingsUpdate,
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setSaving] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await announcementService.updateSettings(sessionId, settings);
      onSettingsUpdate?.();
    } catch (error) {
      console.error("Error updating announcement settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h3 className={styles.title}>DJ Announcement Settings</h3>

      <div className={styles.setting}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.enable_announcements}
            onChange={(e) =>
              handleChange("enable_announcements", e.target.checked)
            }
            className={styles.checkbox}
          />
          Enable DJ Announcements
        </label>
      </div>

      <div className={styles.setting}>
        <label className={styles.label} htmlFor="voice-style">
          Voice Style
        </label>
        <select
          id="voice-style"
          value={settings.voice_style}
          onChange={(e) => handleChange("voice_style", e.target.value)}
          className={styles.select}
          disabled={!settings.enable_announcements}
        >
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="energetic">Energetic</option>
          <option value="calm">Calm</option>
        </select>
      </div>

      <div className={styles.setting}>
        <label className={styles.label} htmlFor="announcement-frequency">
          Announcement Frequency
        </label>
        <select
          id="announcement-frequency"
          value={settings.announcement_frequency}
          onChange={(e) =>
            handleChange("announcement_frequency", e.target.value)
          }
          className={styles.select}
          disabled={!settings.enable_announcements}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit" className={styles.button} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
};
