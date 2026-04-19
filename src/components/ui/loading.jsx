import React from "react";

const PageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-muted rounded-full animate-spin border-t-primary"></div>
      </div>
    </div>
  );
};

export { PageLoading };
