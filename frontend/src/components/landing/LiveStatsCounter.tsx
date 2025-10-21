'use client';

import { useEffect, useState } from 'react';

export function LiveStatsCounter() {
  const [stats, setStats] = useState({
    total_tracks_generated: 0,
    active_users: 0,
    average_rating: 4.9,
  });

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/v1/stats/`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div>
        <div className="text-4xl font-bold text-indigo-600 mb-2">
          {stats.total_tracks_generated.toLocaleString()}+
        </div>
        <div className="text-gray-600 dark:text-gray-400">Tracks Generated</div>
      </div>

      <div>
        <div className="text-4xl font-bold text-indigo-600 mb-2">
          {stats.active_users.toLocaleString()}+
        </div>
        <div className="text-gray-600 dark:text-gray-400">Active Users</div>
      </div>

      <div>
        <div className="text-4xl font-bold text-indigo-600 mb-2">
          {stats.average_rating}/5
        </div>
        <div className="text-gray-600 dark:text-gray-400">Average Rating</div>
      </div>
    </div>
  );
}
