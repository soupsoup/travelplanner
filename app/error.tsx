"use client";

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  React.useEffect(() => {
    // Log the error to console for debugging
    console.error('Error boundary caught:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! Something went wrong.</h1>
        <p className="text-gray-600 mb-4">Please try again later.</p>
        
        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-medium text-red-800">Error Details:</p>
            <p className="text-xs text-red-700 mt-1 break-words">{error.message}</p>
          </div>
        )}
        
        <button
          onClick={reset}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Error; 