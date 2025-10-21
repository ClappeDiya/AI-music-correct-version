"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin_tools/settings");
        if (!res.ok) {
          throw new Error("Failed to fetch settings.");
        }
        const data = await res.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Key", accessor: "key" },
    { header: "Value", accessor: "value" },
    { header: "Description", accessor: "description" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Application Settings</h1>
      <p className="mb-4">
        Manage configuration settings for moderation and platform behavior.
      </p>
      {loading && <p>Loading settings...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <AdminTable columns={columns} data={settings} />}
    </div>
  );
};

export default SettingsPage;
