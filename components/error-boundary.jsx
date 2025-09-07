"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {this.props.message ||
                  "An unexpected error occurred. Please try refreshing the page."}
              </p>

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                {this.props.showDetails && this.state.error && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary for functional components
 * Wraps the ErrorBoundary class component
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  message,
  showDetails = false,
  onError,
}) {
  return (
    <ErrorBoundary
      fallback={fallback}
      message={message}
      showDetails={showDetails}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

export { ErrorBoundary };
