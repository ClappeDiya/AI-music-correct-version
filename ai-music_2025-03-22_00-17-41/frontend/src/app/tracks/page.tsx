"use client";

import { useState, useEffect } from "react";
import { TrackGrid } from "@/components/tracks/TrackGrid";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/usetoast";
import { Search, Filter } from "lucide-react";
import { TrackReference } from "@/services/trackReferenceService";

type SortOption = "newest" | "oldest" | "title" | "updated";
type FilterOption = "all" | "mine" | "shared" | "public";

export default function TracksPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [references, setReferences] = useState<TrackReference[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Load track references
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetch("/api/track-references");
        if (!response.ok) throw new Error("Failed to load tracks");
        const data = await response.json();
        setReferences(data);
      } catch (error) {
        console.error("Error loading tracks:", error);
        toast({
          title: "Error",
          description: "Failed to load tracks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReferences();
  }, [toast]);

  // Handle version change
  const handleVersionChange = async (referenceId: string, version: number) => {
    try {
      const response = await fetch(
        `/api/track-references/${referenceId}/version/${version}`,
        {
          method: "PATCH",
        },
      );
      if (!response.ok) throw new Error("Failed to update version");

      // Update references list
      setReferences((prev) =>
        prev.map((ref) =>
          ref.id === referenceId ? { ...ref, currentVersion: version } : ref,
        ),
      );

      toast({
        title: "Success",
        description: "Track version updated",
      });
    } catch (error) {
      console.error("Error updating version:", error);
      toast({
        title: "Error",
        description: "Failed to update track version",
        variant: "destructive",
      });
    }
  };

  // Filter and sort references
  const filteredReferences = references
    .filter((ref) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ref.metadata.title.toLowerCase().includes(query) ||
          ref.metadata.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          ref.userId.toLowerCase().includes(query)
        );
      }

      // Apply visibility filter
      switch (filterBy) {
        case "mine":
          return ref.userId === "current-user-id"; // Replace with actual user ID
        case "shared":
          return ref.visibility === "shared";
        case "public":
          return ref.visibility === "public";
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title":
          return a.metadata.title.localeCompare(b.metadata.title);
        case "updated":
          return (
            new Date(b.versions[b.versions.length - 1].createdAt).getTime() -
            new Date(a.versions[a.versions.length - 1].createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Saved Tracks</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterBy}
            onValueChange={(value: FilterOption) => setFilterBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              <SelectItem value="mine">My Tracks</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Track Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading tracks...</div>
      ) : (
        <TrackGrid
          references={filteredReferences}
          onVersionChange={handleVersionChange}
        />
      )}
    </div>
  );
}
