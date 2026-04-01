import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRestart = () => {
    // Clear game state to prevent crash loop if the state is corrupted
    localStorage.removeItem('cryptogram-saved-game');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-50 text-slate-800 p-6 text-center" dir="rtl">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
            </div>
            <h1 className="text-2xl font-black mb-4">אופס, משהו השתבש</h1>
            <p className="text-slate-600 mb-8">
              אירעה שגיאה לא צפויה. אנחנו מתנצלים על חוסר הנוחות.
            </p>
            <button
              onClick={this.handleRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md active:scale-95"
            >
              לחץ כאן כדי להתחיל משחק חדש
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
