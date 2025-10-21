import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock, Mic } from "lucide-react";
import { VoiceRecordingSession } from "@/services/api/voice_cloning";
import { formatDistanceToNow } from "date-fns";

interface Props {
  session: VoiceRecordingSession;
}

export function RecordingSessionCard({ session }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          {session.session_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Badge variant={session.ended_at ? "secondary" : "default"}>
            {session.ended_at ? "Completed" : "In Progress"}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(session.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
