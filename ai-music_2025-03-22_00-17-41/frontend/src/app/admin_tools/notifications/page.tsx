"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";

interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin_tools/notifications");
        if (!res.ok) {
          throw new Error("Failed to fetch notifications.");
        }
        const data = await res.json();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Title", accessor: "title" },
    { header: "Message", accessor: "message" },
    { header: "Status", accessor: "status" },
    { header: "Timestamp", accessor: "created_at" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="mb-4">Latest system notifications are listed below.</p>
      {loading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <AdminTable columns={columns} data={notifications} />
      )}
    </div>
  );
};

export default NotificationsPage;
