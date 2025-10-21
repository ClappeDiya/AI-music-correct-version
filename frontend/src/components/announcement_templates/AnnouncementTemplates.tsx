"use client";

import React, { useState, useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/useToast";
import {
  MessageSquarePlus,
  Languages,
  Edit2,
  Trash2,
  Save,
  FileText,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  language: string;
  category: "track_change" | "mood_change" | "custom";
}

interface AnnouncementTemplatesProps {
  sessionId: number;
  className?: string;
}

export function AnnouncementTemplates({
  sessionId,
  className,
}: AnnouncementTemplatesProps) {
  const { currentLanguage, supportedLanguages } = useLanguageStore();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [currentLanguage]);

  const loadTemplates = async () => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/announcement_templates/?language=${currentLanguage}`,
      );
      if (!response.ok) throw new Error("Failed to load templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcement templates",
      });
    }
  };

  const handleSaveTemplate = async (template: Partial<Template>) => {
    try {
      const url = `/api/sessions/${sessionId}/announcement_templates/`;
      const method = editingTemplate ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          id: editingTemplate?.id,
          language: currentLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to save template");

      toast({
        title: "Success",
        description: `Template ${editingTemplate ? "updated" : "created"} successfully`,
      });

      setIsDialogOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save template",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/announcement_templates/${templateId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete template");

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      loadTemplates();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Announcement Templates
        </CardTitle>
        <CardDescription>
          Manage your DJ announcement templates for different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {supportedLanguages.find((l) => l.code === currentLanguage)?.name}
            </span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingTemplate(null)}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription>
                  Create or edit announcement templates for your AI DJ
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveTemplate({
                    name: formData.get("name") as string,
                    content: formData.get("content") as string,
                    category: formData.get("category") as Template["category"],
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTemplate?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={editingTemplate?.category || "track_change"}
                  >
                    <option value="track_change">Track Change</option>
                    <option value="mood_change">Mood Change</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={editingTemplate?.content}
                    required
                    className="min-h-[100px]"
                    placeholder="Use {track_title}, {artist}, {mood}, etc. as placeholders"
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="capitalize">
                    {template.category.replace("_", " ")}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {template.content}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>No templates found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
