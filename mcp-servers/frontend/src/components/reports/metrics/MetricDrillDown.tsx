"use client";

import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useIntersectionObserver } from "@/hooks/useintersection-observer";
import { reportResultsApi } from "@/lib/api/reports";

interface MetricDrillDownProps {
  reportId: number;
  metricKey: string;
  onBack: () => void;
}

export function MetricDrillDown({
  reportId,
  metricKey,
  onBack,
}: MetricDrillDownProps) {
  const [loadMoreRef, isIntersecting] = useIntersectionObserver();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["report-drill-down", reportId, metricKey],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await reportResultsApi.getDrillDown(
          reportId,
          metricKey,
          pageParam,
        );
        return response.data;
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
      initialPageParam: 1,
    });

  // Load more data when the user scrolls to the bottom
  if (isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const columns = data?.pages[0]?.data[0]
    ? Object.keys(data.pages[0].data[0])
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Summary
        </Button>
        <h3 className="text-lg font-medium">{metricKey} Details</h3>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pages.map((page, pageIndex) =>
              page.data.map((row: any, rowIndex: number) => (
                <TableRow key={`${pageIndex}-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {formatCellValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="flex h-8 items-center justify-center">
          {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatCellValue(value: any): string {
  if (value == null) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  }
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object") return JSON.stringify(value);
  return value.toString();
}
