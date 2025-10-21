import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DynamicPreference {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

interface DynamicPreferencesContextType {
  textSize: number;
  setTextSize: (size: number) => void;
  preferences: DynamicPreference[];
  loading: boolean;
  error: Error | null;
  getPreference: (key: string) => any;
  setPreference: (key: string, value: any) => Promise<void>;
  removePreference: (key: string) => Promise<void>;
}

const DynamicPreferencesContext = createContext<DynamicPreferencesContextType>({
  textSize: 1.0,
  setTextSize: () => {},
  preferences: [],
  loading: false,
  error: null,
  getPreference: () => null,
  setPreference: async () => {},
  removePreference: async () => {},
});

export const DynamicPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [textSize, setTextSize] = useState(1.0);
  const [preferences, setPreferences] = useState<DynamicPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.settings.dynamicPreferences.list();
      setPreferences(response.data.results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getPreference = (key: string) => {
    const pref = preferences.find((p) => p.key === key);
    return pref ? pref.value : null;
  };

  const setPreference = async (key: string, value: any) => {
    try {
      const existing = preferences.find((p) => p.key === key);
      let response;

      if (existing) {
        response = await api.settings.dynamicPreferences.update(existing.id, {
          value,
        });
      } else {
        response = await api.settings.dynamicPreferences.create({ key, value });
      }

      setPreferences((prev) => {
        const existingIndex = prev.findIndex((p) => p.key === key);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = response.data;
          return updated;
        }
        return [...prev, response.data];
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const removePreference = async (key: string) => {
    try {
      const pref = preferences.find((p) => p.key === key);
      if (pref) {
        await api.settings.dynamicPreferences.delete(pref.id);
        setPreferences((prev) => prev.filter((p) => p.key !== key));
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <DynamicPreferencesContext.Provider
      value={{
        textSize,
        setTextSize,
        preferences,
        loading,
        error,
        getPreference,
        setPreference,
        removePreference,
      }}
    >
      {children}
    </DynamicPreferencesContext.Provider>
  );
};

export const useDynamicPreferences = () =>
  useContext(DynamicPreferencesContext);
