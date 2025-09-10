import React from 'react';

export const AppInfo: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur rounded-xl p-4 border border-pink-500/20 text-center">
      <div className="text-gray-400 text-sm">
        JB Alwikobra E-commerce v1.0.0
      </div>
      <div className="text-gray-500 text-xs mt-1">
        © 2024 All rights reserved
      </div>
    </div>
  );
};
