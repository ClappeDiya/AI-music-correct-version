import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { format } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";

interface ContentFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  contentType: string;
  violationType: string;
  severity: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  status: string;
}

export function ContentFilters({ onFilterChange }: ContentFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    contentType: "",
    violationType: "",
    severity: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    status: "",
  });

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-lg">
      <Select
        value={filters.contentType}
        onValueChange={(value) => handleFilterChange("contentType", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Content Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="track">Tracks</SelectItem>
          <SelectItem value="post">Posts</SelectItem>
          <SelectItem value="comment">Comments</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.violationType}
        onValueChange={(value) => handleFilterChange("violationType", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Violation Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Violations</SelectItem>
          <SelectItem value="hate_speech">Hate Speech</SelectItem>
          <SelectItem value="copyright">Copyright</SelectItem>
          <SelectItem value="harassment">Harassment</SelectItem>
          <SelectItem value="spam">Spam</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.severity}
        onValueChange={(value) => handleFilterChange("severity", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Severity</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[250px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange.from}
            selected={filters.dateRange}
            onSelect={(range: any) => handleFilterChange("dateRange", range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange("status", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="escalated">Escalated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
