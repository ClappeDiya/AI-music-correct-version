import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: "csv" | "pdf") => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <div className="relative group">
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
        <div className="py-1">
          <button
            onClick={() => onExport("csv")}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as CSV
          </button>
          <button
            onClick={() => onExport("pdf")}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
