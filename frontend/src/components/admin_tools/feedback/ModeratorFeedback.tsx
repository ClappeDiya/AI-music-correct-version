import { useState, useEffect } from "react";
import {
  advancedModerationApi,
  ModeratorFeedback,
} from "@/services/admin_tools/AdvancedModeration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Plus, MessageSquare } from "lucide-react";

export function ModeratorFeedbackDashboard() {
  const [feedbackItems, setFeedbackItems] = useState<ModeratorFeedback[]>([]);
  const [showNewFeedback, setShowNewFeedback] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (selectedStatus !== "all") params.status = selectedStatus;
        if (selectedCategory !== "all") params.category = selectedCategory;

        const response = await advancedModerationApi.getFeedback(params);
        setFeedbackItems(response.results);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [selectedStatus, selectedCategory]);

  const handleSubmitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await advancedModerationApi.submitFeedback({
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        severity: formData.get("severity") as "low" | "medium" | "high",
      });

      setShowNewFeedback(false);
      // Refresh feedback list
      const response = await advancedModerationApi.getFeedback({
        status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      setFeedbackItems(response.results);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moderator Feedback</h2>
        <Button onClick={() => setShowNewFeedback(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Feedback
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ui_ux">UI/UX</SelectItem>
            <SelectItem value="workflow">Workflow</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="bug">Bug Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {feedbackItems.map((feedback) => (
            <Card key={feedback.created_at} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {feedback.category.replace("_", " ").toUpperCase()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`
                          ${feedback.severity === "high" && "bg-red-100 text-red-800"}
                          ${feedback.severity === "medium" && "bg-yellow-100 text-yellow-800"}
                          ${feedback.severity === "low" && "bg-blue-100 text-blue-800"}
                        `}
                      >
                        {feedback.severity.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`
                          ${feedback.status === "open" && "bg-green-100 text-green-800"}
                          ${feedback.status === "in_progress" && "bg-blue-100 text-blue-800"}
                          ${feedback.status === "resolved" && "bg-gray-100 text-gray-800"}
                        `}
                      >
                        {feedback.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{feedback.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={showNewFeedback} onOpenChange={setShowNewFeedback}>
        <DialogContent className="max-w-lg w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Submit New Feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui_ux">UI/UX</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="feature_request">
                    Feature Request
                  </SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select name="severity" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                placeholder="Describe your feedback..."
                required
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter className="sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewFeedback(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
