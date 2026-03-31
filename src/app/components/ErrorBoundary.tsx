import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-electric-blue/5 via-vibrant-purple/5 to-electric-blue/5">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ứng dụng gặp sự cố. Vui lòng tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Tải lại trang
            </button>
            {this.state.error && (
              <details className="mt-4 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-w-2xl mx-auto">
                <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-red-800 dark:text-red-300">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
