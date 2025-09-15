import { ErrorBoundary } from "@/components/error-boundary";

export function POSLayout({
  children,
  isLoading = false,
  error = null,
  errorMessage = "Failed to load POS system. Please try refreshing the page.",
  showErrorBoundary = true,
}) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading POS system...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="flex items-center justify-center h-screen">
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
              Failed to load POS system
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden p-2 sm:p-3 lg:p-4">
      {children}
    </div>
  );

  if (showErrorBoundary) {
    return <ErrorBoundary message={errorMessage}>{content}</ErrorBoundary>;
  }

  return content;
}
