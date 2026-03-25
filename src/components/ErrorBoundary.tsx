import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-6">
          <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-sm border border-[#E5E5E0] text-center">
            <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Đã có lỗi xảy ra</h2>
            <p className="text-[#5A5A40] mb-8">Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#5A5A40] text-white py-4 rounded-full hover:bg-[#4A4A30] transition-all"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
