import React from 'react';
import { TableData, TableRow } from '../types';

interface DataTableProps {
  data: TableData;
  onRowClick: (row: TableRow, index: number) => void;
  selectedRowIndex: number | null;
}

export function DataTable({
  data,
  onRowClick,
  selectedRowIndex,
}: DataTableProps) {
  
  // Filter headers to show only 'Ementa' and 'Data'
  const visibleHeaders = data.headers.filter(
    (header: any) => header === 'Ementa' || header === 'Data'
  );

  // Get indices of visible columns
  const visibleIndices = data.headers.map((header: string, index: number) => 
    visibleHeaders.includes(header) ? index : -1 
  ).filter(index => index !== -1);

  const createRowObject = (row: string[]): TableRow => {
    const obj: TableRow = {};
    data.headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  };

  return (
    <div className="overflow-hidden">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {visibleHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 break-words max-w-[200px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, rowIndex) => {
            const rowData = createRowObject(row);
            const visibleCells = visibleIndices.map(index => row[index]);

            return (
              <tr
                key={rowIndex}
                onClick={() => onRowClick(rowData, rowIndex)}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRowIndex === rowIndex ? 'bg-blue-50' : ''
                }`}
              >
                {visibleCells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-4 text-sm text-gray-500 break-words max-w-[200px]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
