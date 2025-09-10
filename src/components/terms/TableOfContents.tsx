import React from 'react';
import { TableOfContentsItem } from '../../hooks/useTerms';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  onItemClick: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, onItemClick }) => {
  const handleClick = (id: string) => {
    onItemClick(id);
  };

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Daftar Isi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className="text-left p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
};
