"use client";

import React from "react";
import { PageLoading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";

export function PageLayout({
  children,
  isLoading = false,
  error = null,
  errorMessage = "Failed to load page content. Please try refreshing the page.",
  showErrorBoundary = true,
}) {
  // Show loading state
  if (isLoading) {
    return <PageLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-3 p-3 sm:space-y-4 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Failed to load content
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || "An error occurred while loading the page"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden space-y-4 p-4 sm:space-y-6 sm:p-6">
      {children}
    </div>
  );

  if (showErrorBoundary) {
    return <ErrorBoundary message={errorMessage}>{content}</ErrorBoundary>;
  }

  return content;
}
