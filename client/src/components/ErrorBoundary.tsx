import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorStack: string | null;
}

/**
 * ErrorBoundary component to catch and display JavaScript errors
 * that occur within the component tree below it.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorStack: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorStack: error.stack || null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error stack trace:', errorInfo.componentStack);
    console.error('Complete error object:', JSON.stringify(error, null, 2));
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 max-w-xl mx-auto my-8 bg-red-50 border-2 border-red-200 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <div className="bg-white p-4 rounded border border-red-100 mb-4">
            <p className="font-mono text-red-600 mb-2">{this.state.error?.message}</p>
            {this.state.errorStack && (
              <pre className="whitespace-pre-wrap text-xs text-gray-700 overflow-auto max-h-60">
                {this.state.errorStack}
              </pre>
            )}
          </div>
          <p className="text-sm text-gray-700">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;