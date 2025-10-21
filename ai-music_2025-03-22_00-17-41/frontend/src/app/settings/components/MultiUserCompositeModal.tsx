import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { UserList } from "@/app/settings/components/UserList";
import { CompositePreferencesForm } from "@/app/settings/components/CompositePreferencesForm";
import { Button } from "@/components/ui/Button";
import { Users, Settings } from "lucide-react";

interface Preference {
  key: string;
  label: string;
  type: "number" | "boolean" | "string";
  value: any;
}

export function MultiUserCompositeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([
    { key: "volume", label: "Volume Level", type: "number", value: 50 },
    { key: "theme", label: "Dark Mode", type: "boolean", value: false },
    { key: "language", label: "Language", type: "string", value: "en" },
  ]);

  const calculateCompositePreferences = () => {
    // Calculate average for numeric preferences
    const volumePref = preferences.find((p) => p.key === "volume");
    if (volumePref) {
      const total = participants.reduce(
        (sum, user) => sum + (user.preferences?.volume || 50),
        0,
      );
      volumePref.value = Math.round(total / participants.length);
    }

    // Calculate majority for boolean preferences
    const themePref = preferences.find((p) => p.key === "theme");
    if (themePref) {
      const darkModeCount = participants.filter(
        (user) => user.preferences?.theme === true,
      ).length;
      themePref.value = darkModeCount > participants.length / 2;
    }

    // Calculate most common for string preferences
    const languagePref = preferences.find((p) => p.key === "language");
    if (languagePref) {
      const languageCounts: Record<string, number> = participants.reduce(
        (counts, user) => {
          const lang = user.preferences?.language || "en";
          counts[lang] = (counts[lang] || 0) + 1;
          return counts;
        },
        {},
      );

      languagePref.value = Object.entries(languageCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b,
      )[0];
    }

    setPreferences([...preferences]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Multi-User Composite Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
              <Users className="w-4 h-4" />
              Select Participants
            </h3>
            <UserList
              participants={participants}
              onParticipantsChange={setParticipants}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Composite Preferences</h3>
            <CompositePreferencesForm
              preferences={preferences}
              onChange={setPreferences}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={calculateCompositePreferences}>
              Calculate Composite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
