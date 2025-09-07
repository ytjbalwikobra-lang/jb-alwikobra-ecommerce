import React from 'react';

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

const baseInputClasses = `
  w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white 
  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
  disabled:opacity-50 disabled:cursor-not-allowed
  placeholder-gray-400
`;

const AdminInput: React.FC<AdminInputProps> = ({ label, error, helpText, className = '', ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <input
        className={`${baseInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-400">{helpText}</p>}
    </div>
  );
};

const AdminTextarea: React.FC<AdminTextareaProps> = ({ label, error, helpText, className = '', ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <textarea
        className={`${baseInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-400">{helpText}</p>}
    </div>
  );
};

const AdminSelect: React.FC<AdminSelectProps> = ({ label, error, helpText, className = '', children, ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <select
        className={`${baseInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-400">{helpText}</p>}
    </div>
  );
};

export { AdminInput, AdminTextarea, AdminSelect };
