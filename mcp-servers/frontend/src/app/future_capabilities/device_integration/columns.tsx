import { ColumnDef } from "@tanstack/react-table";
import { DeviceIntegrationConfig } from '@/lib/types/future_capabilities";
import { DataTableColumnHeader } from '@/components/future_capabilities/data_table_column_header";
import { DataTableRowActions } from '@/components/future_capabilities/data_table_row_actions";
import { Badge } from '@/components/ui/Badge';

const deviceTypeColors = {
  midi_controller: "bg-purple-500",
  audio_interface: "bg-blue-500",
  vr_controller: "bg-green-500",
  motion_sensor: "bg-yellow-500",
  biometric_sensor: "bg-orange-500",
  custom: "bg-gray-500",
};

const connectionTypeColors = {
  usb: "bg-blue-500",
  bluetooth: "bg-indigo-500",
  wifi: "bg-green-500",
  serial: "bg-yellow-500",
  network: "bg-purple-500",
};

const statusColors = {
  connected: "bg-green-500",
  disconnected: "bg-gray-500",
  error: "bg-red-500",
  pairing: "bg-yellow-500",
};

export const columns: ColumnDef<DeviceIntegrationConfig>[] = [
  {
    accessorKey: "device_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device Name" />
    ),
  },
  {
    accessorKey: "device_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("device_type") as keyof typeof deviceTypeColors;
      return (
        <Badge className={deviceTypeColors[value]}>
          {value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "connection_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Connection" />
    ),
    cell: ({ row }) => {
      const value = row.getValue(
        "connection_type"
      ) as keyof typeof connectionTypeColors;
      return (
        <Badge className={connectionTypeColors[value]}>
          {value.toUpperCase()}
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
    accessorKey: "configuration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Config" />
    ),
    cell: ({ row }) => {
      const config = row.getValue("configuration") as Record<string, any>;
      const count = Object.keys(config || {}).length;
      return count ? (
        <Badge variant="outline">{count} settings</Badge>
      ) : null;
    },
  },
  {
    accessorKey: "mapping_rules",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mappings" />
    ),
    cell: ({ row }) => {
      const rules = row.getValue("mapping_rules") as Record<string, any>;
      const count = Object.keys(rules || {}).length;
      return count ? (
        <Badge variant="outline">{count} rules</Badge>
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
      return data && Object.keys(data).length > 0 ? (
        <Badge variant="outline">Calibrated</Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-500">
          Uncalibrated
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];



