import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface AdminTableCellProps {
  children: React.ReactNode;
  className?: string;
}

const AdminTable: React.FC<AdminTableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-orange-600 to-orange-700">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

const AdminTableRow: React.FC<AdminTableRowProps> = ({ children, className = '', onClick }) => {
  return (
    <tr 
      className={`
        hover:bg-gray-700 transition-colors duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const AdminTableCell: React.FC<AdminTableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${className}`}>
      {children}
    </td>
  );
};

export { AdminTable, AdminTableRow, AdminTableCell };
