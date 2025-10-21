import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { ReportData } from "@/types/reports";

interface ReportTableProps {
  data: ReportData[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ReportTable({ data, onView, onDownload }: ReportTableProps) {
  return (
    <div className="w-full">
      <Table>
        <thead>
          <tr>
            <th className="w-[200px]">Report Name</th>
            <th>Generated Date</th>
            <th>Type</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((report) => (
            <tr key={report.id}>
              <td className="font-medium">{report.name}</td>
              <td>{new Date(report.generatedAt).toLocaleDateString()}</td>
              <td className="capitalize">{report.type}</td>
              <td>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    report.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : report.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {report.status}
                </span>
              </td>
              <td className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(report.id)}
                  className="mr-2"
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(report.id)}
                >
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
