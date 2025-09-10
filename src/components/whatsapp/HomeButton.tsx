import React from 'react';

interface HomeButtonProps {
  onNavigateHome: () => void;
}

export const HomeButton: React.FC<HomeButtonProps> = ({ onNavigateHome }) => {
  return (
    <button
      onClick={onNavigateHome}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
    >
      Return to Home
    </button>
  );
};
