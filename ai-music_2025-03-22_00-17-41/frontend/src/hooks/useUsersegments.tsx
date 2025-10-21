import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/Input";
import { useFeatureFlagAdmin } from "@/lib/hooks/UseFeatureFlags";
import { Plus, Search, Users, Edit2, Trash2 } from "lucide-react";
import { CreateSegmentDialog } from "./create-segment-dialog";

interface UserSegmentsProps {
  environment: string;
}

export function UserSegments({ environment }: UserSegmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

  // Mock data - replace with real API calls
  const segments = [
    {
      id: "1",
      name: "Premium Users",
      description: "Users with an active premium subscription",
      rules: {
        operator: "and",
        conditions: [
          {
            property: "subscription.type",
            comparison: "equals",
            value: "premium",
          },
          {
            property: "subscription.status",
            comparison: "equals",
            value: "active",
          },
        ],
      },
      userCount: 1250,
      flagCount: 5,
    },
    {
      id: "2",
      name: "Power Users",
      description: "Users with high engagement metrics",
      rules: {
        operator: "and",
        conditions: [
          { property: "uploads.count", comparison: "greater_than", value: 100 },
          {
            property: "activity.lastWeek",
            comparison: "greater_than",
            value: 20,
          },
        ],
      },
      userCount: 750,
      flagCount: 3,
    },
    // Add more mock segments...
  ];

  const handleCreateSegment = async (data: any) => {
    // Implement segment creation logic
    console.log("Creating segment:", data);
    setShowCreateDialog(false);
  };

  const handleEditSegment = (segment: any) => {
    setSelectedSegment(segment);
    setShowCreateDialog(true);
  };

  const handleDeleteSegment = async (segmentId: string) => {
    // Implement segment deletion logic
    console.log("Deleting segment:", segmentId);
  };

  const filteredSegments = segments.filter(
    (segment) =>
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">User Segments</h2>
          <p className="text-sm text-muted-foreground">
            Manage user segments for targeted feature rollouts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search segments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSegments.map((segment) => (
            <Card key={segment.id}>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{segment.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSegment(segment)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSegment(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{segment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {segment.userCount.toLocaleString()} users
                      </span>
                    </div>
                    <Badge variant="secondary">{segment.flagCount} flags</Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Rules</h4>
                    <div className="space-y-1">
                      {segment.rules.conditions.map(
                        (condition: any, index: number) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {condition.property} {condition.comparison}{" "}
                            {condition.value}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <CreateSegmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        segment={selectedSegment}
        onCreate={handleCreateSegment}
      />
    </div>
  );
}
