"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";

interface AuditLog {
  id: string;
  actor_user: string;
  action_description: string;
  related_ref: string;
  timestamp: string;
}

const SecurityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin_tools/audit-logs");
        if (!res.ok) {
          throw new Error("Failed to fetch audit logs.");
        }
        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Actor", accessor: "actor_user" },
    { header: "Action", accessor: "action_description" },
    { header: "Related Ref", accessor: "related_ref" },
    { header: "Timestamp", accessor: "timestamp" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Security Overview</h1>
      <p className="mb-4">
        Audit logs and recent security actions are displayed below.
      </p>
      {loading && <p>Loading audit logs...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <AdminTable columns={columns} data={logs} />}
    </div>
  );
};

export default SecurityPage;
