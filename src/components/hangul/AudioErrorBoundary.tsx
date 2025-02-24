
import React, { Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class AudioErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Audio Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Audio playback unavailable</span>
        </div>
      );
    }

    return this.props.children;
  }
}

