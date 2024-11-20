import React from 'react';
import { TableRow } from '../types';
import { X, Calendar } from 'lucide-react';

interface ContentPreviewProps {
  data: TableRow | null;
  onClose: () => void;
}

export function ContentPreview({ data, onClose }: ContentPreviewProps) {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Select a row to view its content</p>
      </div>
    );
  }

  const content = data['CONTEUDO'] || data['conteudo'] || data['Conteudo'] || '';
  const date = data['Data'] || data['DATA'] || data['data'] || '';

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {(date || content) ? (
          <div className="space-y-4">
            {date && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar size={16} />
                  <h4 className="font-medium">Date</h4>
                </div>
                <p className="text-sm text-gray-600">{date}</p>
              </div>
            )}
            {content && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Content</h4>
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-600 font-mono">
                  {content}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No content available for this row</p>
          </div>
        )}
      </div>
    </div>
  );
}