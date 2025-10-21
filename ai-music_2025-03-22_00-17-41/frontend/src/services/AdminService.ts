import { useState, useEffect } from "react";

export function useAdminStats() {
  const [data, setData] = useState({
    totalUsers: 1000,
    activeTracks: 200,
    newComments: 50,
    reports: 5,
  });

  // Simulate fetch with a timer (replace this with real API call if available)
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        totalUsers: 1000,
        activeTracks: 200,
        newComments: 50,
        reports: 5,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { data };
}
