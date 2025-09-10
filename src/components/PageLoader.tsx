import React, { memo } from 'react';

const PageLoader: React.FC = memo(() => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent mx-auto mb-3" />
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

export default PageLoader;
