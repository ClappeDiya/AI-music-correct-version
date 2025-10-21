import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  filters: ReportFilters;
}

interface ReportFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  type: string;
  status: string;
  search: string;
}

export function ReportFilters({ onFilterChange, filters }: ReportFiltersProps) {
  const handleDateRangeChange = (dateRange: {
    startDate: Date;
    endDate: Date;
  }) => {
    onFilterChange({ ...filters, dateRange });
  };

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={filters.type}
          onValueChange={handleTypeChange}
          options={[
            { label: "All Types", value: "all" },
            { label: "Performance", value: "performance" },
            { label: "Usage", value: "usage" },
            { label: "Financial", value: "financial" },
          ]}
          className="w-full sm:w-[200px]"
        />
        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
          options={[
            { label: "All Status", value: "all" },
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
          ]}
          className="w-full sm:w-[200px]"
        />
      </div>
      <div className="flex justify-end">
        <DateRangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
}
