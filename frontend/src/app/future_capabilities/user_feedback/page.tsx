"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Layout } from '@/components/future_capabilities/layout";
import { DataTable } from '@/components/future_capabilities/data_table";
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { DataForm } from '@/components/future_capabilities/data_form";
import { futureCapabilitiesApi } from '@/lib/api/future_capabilities";
import { UserFeedbackLog } from '@/lib/types/future_capabilities";
import { columns } from "./columns";
import { formSchema } from "./schema";

const formFields = [
  {
    name: "user_id",
    label: "User ID",
    type: "text" as const,
    description: "ID of the user providing feedback",
  },
  {
    name: "feedback_type",
    label: "Feedback Type",
    type: "select" as const,
    options: [
      { label: "Bug Report", value: "bug_report" },
      { label: "Feature Request", value: "feature_request" },
      { label: "Improvement", value: "improvement" },
      { label: "General", value: "general" },
      { label: "Performance", value: "performance" },
      { label: "UI/UX", value: "ui_ux" },
    ],
  },
  {
    name: "feedback_content",
    label: "Feedback Content",
    type: "textarea" as const,
    description: "Detailed feedback from the user",
  },
  {
    name: "satisfaction_rating",
    label: "Satisfaction Rating",
    type: "select" as const,
    options: [
      { label: "Very Satisfied", value: "5" },
      { label: "Satisfied", value: "4" },
      { label: "Neutral", value: "3" },
      { label: "Dissatisfied", value: "2" },
      { label: "Very Dissatisfied", value: "1" },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select" as const,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "New", value: "new" },
      { label: "In Review", value: "in_review" },
      { label: "In Progress", value: "in_progress" },
      { label: "Resolved", value: "resolved" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    name: "attachments",
    label: "Attachments",
    type: "json" as const,
    description: "List of attachment URLs or references",
  },
  {
    name: "metadata",
    label: "Metadata",
    type: "json" as const,
    description: "Additional metadata about the feedback",
  },
];

export default function UserFeedbackPage() {
  const router = useRouter();
  const [data, setData] = React.useState<UserFeedbackLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await futureCapabilitiesApi.userFeedback.list();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load user feedback:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: Partial<UserFeedbackLog>) {
    try {
      await futureCapabilitiesApi.userFeedback.create(formData);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to create feedback:", error);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between space-x-4 p-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Feedback</h2>
          <p className="text-muted-foreground">
            Track and manage user feedback and feature requests
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User Feedback</DialogTitle>
            </DialogHeader>
            <DataForm
              schema={formSchema}
              fields={formFields}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={data}
          filterableColumns={[
            {
              id: "feedback_type",
              title: "Type",
              options: [
                { label: "Bug Report", value: "bug_report" },
                { label: "Feature Request", value: "feature_request" },
                { label: "Improvement", value: "improvement" },
                { label: "General", value: "general" },
                { label: "Performance", value: "performance" },
                { label: "UI/UX", value: "ui_ux" },
              ],
            },
            {
              id: "priority",
              title: "Priority",
              options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
              ],
            },
            {
              id: "status",
              title: "Status",
              options: [
                { label: "New", value: "new" },
                { label: "In Review", value: "in_review" },
                { label: "In Progress", value: "in_progress" },
                { label: "Resolved", value: "resolved" },
                { label: "Closed", value: "closed" },
              ],
            },
          ]}
          searchableColumns={[
            {
              id: "user_id",
              title: "User ID",
            },
            {
              id: "feedback_content",
              title: "Content",
            },
          ]}
        />
      </div>
    </Layout>
  );
}



