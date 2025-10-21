import React from "react";
import { useVoiceCommand } from "../../hooks/useVoiceCommand";
import styles from "./VoiceCommandButton.module.css";

interface VoiceCommandButtonProps {
  sessionId: number;
  onCommandProcessed?: (action: string) => void;
  onError?: (error: Error) => void;
}

export const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({
  sessionId,
  onCommandProcessed,
  onError,
}) => {
  const { isListening, lastCommand, startListening, stopListening } =
    useVoiceCommand({
      sessionId,
      onCommandProcessed,
      onError,
    });

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleClick}
        className={`${styles.button} ${isListening ? styles.listening : ""}`}
        aria-label={isListening ? "Stop voice command" : "Start voice command"}
      >
        <span className={styles.icon}>{isListening ? "⏹" : "🎤"}</span>
        <span className={styles.text}>
          {isListening ? "Listening..." : "Voice Command"}
        </span>
      </button>
      {lastCommand && (
        <p className={styles.lastCommand}>Last command: {lastCommand}</p>
      )}
    </div>
  );
};
