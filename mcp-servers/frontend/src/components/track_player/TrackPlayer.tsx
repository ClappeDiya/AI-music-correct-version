import React, { useState, useEffect } from "react";
import { useLanguageStore } from "../../stores/languageStore";
import { TrackTranslations } from "../TrackTranslations/TrackTranslations";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import styles from "./TrackPlayer.module.css";

interface Track {
  id: number;
  title: string;
  artist?: string;
  album?: string;
  duration_seconds?: number;
  original_language: string;
  available_translations: string[];
}

interface TrackPlayerProps {
  track: Track;
  onError?: (error: Error) => void;
}

export const TrackPlayer: React.FC<TrackPlayerProps> = ({ track, onError }) => {
  const { currentLanguage } = useLanguageStore();
  const [showTranslations, setShowTranslations] = useState(false);

  // Show translations panel if track is in a different language
  useEffect(() => {
    if (
      track.original_language !== currentLanguage &&
      track.available_translations.includes(currentLanguage)
    ) {
      setShowTranslations(true);
    }
  }, [track, currentLanguage]);

  return (
    <div className={styles.container}>
      <div className={styles.playerControls}>
        {/* Your existing player controls */}
      </div>

      <div className={styles.trackInfo}>
        <div className={styles.mainInfo}>
          <h2 className={styles.title}>{track.title}</h2>
          {track.artist && <p className={styles.artist}>{track.artist}</p>}
          {track.album && <p className={styles.album}>{track.album}</p>}
        </div>

        <div className={styles.languageControls}>
          <LanguageSelector />
          {track.available_translations.length > 0 && (
            <button
              className={styles.translationsToggle}
              onClick={() => setShowTranslations(!showTranslations)}
              aria-expanded={showTranslations}
            >
              {showTranslations ? "Hide" : "Show"} Translations
            </button>
          )}
        </div>

        {showTranslations && (
          <div className={styles.translationsPanel}>
            <TrackTranslations trackId={track.id} onError={onError} />
          </div>
        )}
      </div>

      <div className={styles.progressBar}>
        {/* Your existing progress bar */}
      </div>
    </div>
  );
};
