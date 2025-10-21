"use client";

import React from "react";

interface Column {
  header: string;
  accessor: string;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
}

const AdminTable: React.FC<AdminTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap">
                  {typeof row[col.accessor] === "object"
                    ? JSON.stringify(row[col.accessor])
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
