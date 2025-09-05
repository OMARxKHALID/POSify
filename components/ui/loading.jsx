import React from "react";

const PageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    </div>
  );
};

export { PageLoading };
