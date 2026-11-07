import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#111111] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md max-w-md w-full flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl">
              !
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">An unexpected error occurred</h2>
              <p className="text-xs text-slate-500 mt-1">
                Comentosh encountered an issue while rendering. Your data is safe.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('comentosh_posts');
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#2F80ED] hover:bg-[#256fd1] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
