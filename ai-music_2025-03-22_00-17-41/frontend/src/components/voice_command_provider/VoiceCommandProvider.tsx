import React, { createContext, useContext, useCallback, useState } from "react";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import { VoiceCommandButton } from "../VoiceCommandButton/VoiceCommandButton";
import styles from "./VoiceCommandProvider.module.css";

interface VoiceCommandContextType {
  lastAction: string | null;
  isProcessing: boolean;
}

const VoiceCommandContext = createContext<VoiceCommandContextType>({
  lastAction: null,
  isProcessing: false,
});

export const useVoiceCommandContext = () => useContext(VoiceCommandContext);

interface VoiceCommandProviderProps {
  sessionId: number;
  children: React.ReactNode;
  onAction?: (action: string) => void;
}

export const VoiceCommandProvider: React.FC<VoiceCommandProviderProps> = ({
  sessionId,
  children,
  onAction,
}) => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommandProcessed = useCallback(
    (action: string) => {
      setLastAction(action);
      setIsProcessing(false);
      onAction?.(action);
    },
    [onAction],
  );

  const handleError = useCallback((error: Error) => {
    setError(error.message);
    setIsProcessing(false);
  }, []);

  return (
    <VoiceCommandContext.Provider value={{ lastAction, isProcessing }}>
      <div className={styles.container}>
        <div className={styles.controls}>
          <LanguageSelector />
          <VoiceCommandButton
            sessionId={sessionId}
            onCommandProcessed={handleCommandProcessed}
            onError={handleError}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {children}
      </div>
    </VoiceCommandContext.Provider>
  );
};
