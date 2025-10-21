"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export interface ReportFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  genre?: string;
  userType?: string;
  region?: string;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

const genres = [
  "All Genres",
  "Pop",
  "Rock",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "R&B",
  "Country",
  "Folk",
  "World",
];

const userTypes = [
  "All Users",
  "Free",
  "Premium",
  "Student",
  "Family Plan",
  "Artist",
  "Label",
];

const regions = [
  "Global",
  "North America",
  "Europe",
  "Asia",
  "South America",
  "Africa",
  "Oceania",
];

export function ReportFilters({
  filters,
  onFiltersChange,
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Report Filters</span>
        </CardTitle>
        <CardDescription>
          Filter your report data by date, genre, user type, and region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={{
                      from: filters.dateRange?.from,
                      to: filters.dateRange?.to,
                    }}
                    onSelect={(range) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: {
                          from: range?.from,
                          to: range?.to,
                        },
                      })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Genre</label>
            <Select
              value={filters.genre}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, genre: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">User Type</label>
            <Select
              value={filters.userType}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, userType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select
              value={filters.region}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, region: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region.toLowerCase()}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
