import { useTranslation } from "next-i18next";
import { useState } from "react";

// Shared loading state handler
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = async (callback: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await callback();
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, withLoading };
};

// Shared error handler
export const useErrorHandler = () => {
  const { t } = useTranslation("common");
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(t(`errors.${err.message}`) || err.message);
    } else {
      setError(t("errors.unknown_error"));
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};

// Shared security logger
export const useSecurityLogger = () => {
  const logEvent = async (
    eventType: string,
    details: Record<string, unknown>,
  ) => {
    try {
      await fetch("/api/v1/security-events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: eventType,
          event_details: details,
        }),
      });
    } catch (err) {
      console.error("Failed to log security event:", err);
    }
  };

  return { logEvent };
};

// Shared rate limiter
export const useRateLimiter = (limit: number, interval: number) => {
  const [attempts, setAttempts] = useState<number[]>([]);

  const checkLimit = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < interval,
    );

    if (recentAttempts.length >= limit) {
      return false;
    }

    setAttempts([...recentAttempts, now]);
    return true;
  };

  return { checkLimit };
};

// Password strength validator
export const validatePasswordStrength = (password: string) => {
  const requirements = [
    { regex: /.{8,}/, message: "At least 8 characters" },
    { regex: /[A-Z]/, message: "At least one uppercase letter" },
    { regex: /[a-z]/, message: "At least one lowercase letter" },
    { regex: /[0-9]/, message: "At least one number" },
    { regex: /[^A-Za-z0-9]/, message: "At least one special character" },
  ];

  return requirements
    .filter((req) => !req.regex.test(password))
    .map((req) => req.message);
};
