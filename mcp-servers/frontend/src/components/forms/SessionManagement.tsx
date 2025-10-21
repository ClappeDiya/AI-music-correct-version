import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
}

interface SessionManagementProps {
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllSessions: () => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllSessions,
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Sessions</h2>
        <Button variant="destructive" onClick={onRevokeAllSessions}>
          Log Out All Other Devices
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{parseUserAgent(session.user_agent)}</TableCell>
              <TableCell>{session.ip_address}</TableCell>
              <TableCell>
                {new Date(session.last_activity).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

function parseUserAgent(userAgent: string): string {
  if (/mobile/i.test(userAgent)) {
    return "Mobile Device";
  }
  if (/tablet/i.test(userAgent)) {
    return "Tablet";
  }
  if (/windows/i.test(userAgent)) {
    return "Windows PC";
  }
  if (/macintosh/i.test(userAgent)) {
    return "Mac";
  }
  if (/linux/i.test(userAgent)) {
    return "Linux PC";
  }
  return "Unknown Device";
}
