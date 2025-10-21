import { ColumnDef } from "@tanstack/react-table";
import { MicrofluidicInstrumentConfig } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const instrumentTypeColors = {
  droplet_generator: "bg-blue-500",
  flow_controller: "bg-green-500",
  mixer: "bg-purple-500",
  separator: "bg-yellow-500",
  analyzer: "bg-indigo-500",
  custom: "bg-gray-500",
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  maintenance: "bg-yellow-500",
  error: "bg-red-500",
};

export const columns: ColumnDef<MicrofluidicInstrumentConfig>[] = [
  {
    accessorKey: "instrument_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instrument Name" />
    ),
  },
  {
    accessorKey: "instrument_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("instrument_type") as keyof typeof instrumentTypeColors;
      return (
        <Badge className={instrumentTypeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={statusColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "flow_configuration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow Config" />
    ),
    cell: ({ row }) => {
      const config = row.getValue("flow_configuration") as Record<string, any>;
      const count = Object.keys(config || {}).length;
      return count ? (
        <Badge variant="outline">{count} parameters</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "pressure_settings",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pressure" />
    ),
    cell: ({ row }) => {
      const settings = row.getValue("pressure_settings") as Record<string, any>;
      return settings?.pressure ? (
        <Badge variant="outline">{settings.pressure} kPa</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "temperature_controls",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Temperature" />
    ),
    cell: ({ row }) => {
      const controls = row.getValue("temperature_controls") as Record<string, any>;
      return controls?.target ? (
        <Badge variant="outline">{controls.target}°C</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "calibration_data",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Calibration" />
    ),
    cell: ({ row }) => {
      const data = row.getValue("calibration_data") as Record<string, any>;
      return data?.last_calibration ? (
        <Badge variant="outline">
          {new Date(data.last_calibration).toLocaleDateString()}
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-500">
          Uncalibrated
        </Badge>
      );
    },
  },
  {
    accessorKey: "maintenance_schedule",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Maintenance" />
    ),
    cell: ({ row }) => {
      const schedule = row.getValue("maintenance_schedule") as Record<string, any>;
      return schedule?.next_maintenance ? (
        <Badge variant="outline">
          Due: {new Date(schedule.next_maintenance).toLocaleDateString()}
        </Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



