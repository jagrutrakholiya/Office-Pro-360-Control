'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react';

// ============================================
// ERROR BOUNDARY BASE CLASS
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }
  
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    
    if (
      this.state.hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      !areArraysEqual(prevProps.resetKeys, resetKeys)
    ) {
      this.reset();
    }
  }
  
  reset = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
  
  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo!,
          this.reset
        );
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          reset={this.reset}
        />
      );
    }
    
    return this.props.children;
  }
}

function areArraysEqual(a: Array<string | number>, b: Array<string | number>) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

// ============================================
// DEFAULT ERROR FALLBACK
// ============================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  reset: () => void;
}

function DefaultErrorFallback({ error, errorInfo, reset }: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We encountered an unexpected error
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 font-medium mb-1">
            Error Message:
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm font-mono">
            {error.message || 'Unknown error'}
          </p>
        </div>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
        >
          {showDetails ? '▼' : '▶'} Show technical details
        </button>
        
        {showDetails && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {error.stack}
              {'\n\n'}
              Component Stack:
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function PageErrorBoundary({ children, pageName, onError }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {pageName ? `Error loading ${pageName}` : 'Page Error'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {error.message}
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================
// COMPONENT ERROR BOUNDARY
// ============================================

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  showError?: boolean;
}

export function ComponentErrorBoundary({
  children,
  componentName,
  showError = true,
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) =>
        showError ? (
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {componentName ? `${componentName} failed to load` : 'Component Error'}
                </h3>
                
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error.message}
                </p>
                
                <button
                  onClick={reset}
                  className="mt-2 text-xs text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : null
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================
// ASYNC BOUNDARY WITH RETRY
// ============================================

interface AsyncBoundaryProps {
  children: ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  fallback?: ReactNode;
  onError?: (error: Error, retryCount: number) => void;
}

export function AsyncBoundary({
  children,
  maxRetries = 3,
  retryDelay = 1000,
  fallback,
  onError,
}: AsyncBoundaryProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  
  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      onError?.(error, retryCount);
    },
    [onError, retryCount]
  );
  
  const handleReset = React.useCallback(() => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay]);
  
  return (
    <ErrorBoundary
      resetKeys={[retryCount]}
      onError={handleError}
      onReset={handleReset}
      fallback={(error, errorInfo, reset) => {
        if (isRetrying) {
          return (
            fallback || (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Retrying... ({retryCount}/{maxRetries})
                  </p>
                </div>
              </div>
            )
          );
        }
        
        const canRetry = retryCount < maxRetries;
        
        return (
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load content
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            
            {canRetry ? (
              <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry ({maxRetries - retryCount} attempts left)
              </button>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400">
                Maximum retry attempts reached
              </p>
            )}
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================
// ERROR BOUNDARY WITH LOGGING
// ============================================

interface ErrorBoundaryWithLoggingProps {
  children: ReactNode;
  loggingService?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWithLogging({
  children,
  loggingService,
}: ErrorBoundaryWithLoggingProps) {
  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      // Send to logging service
      loggingService?.(error, errorInfo);
      
      // Also log to console
      console.error('Error logged:', {
        error,
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    },
    [loggingService]
  );
  
  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
