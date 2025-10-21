"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "./LoadingState";
import { ErrorBoundary } from "./ErrorBoundary";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedListProps<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => React.ReactNode;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export function PaginatedList<T>({
  data,
  isLoading,
  error,
  onPageChange,
  renderItem,
  currentPage,
  totalPages,
  pageSize,
}: PaginatedListProps<T>) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorBoundary error={error} reset={() => onPageChange(1)} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">{data.map(renderItem)}</div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
