import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Last-resort UI guard. It prevents one unexpected rendering error from blanking
 * the whole console and keeps the error message rendered as plain text.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected UI error'
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unexpected console UI error', error, info.componentStack);
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fatal-error" role="alert">
        <section className="card fatal-error__card">
          <div className="card__header">
            <div>
              <h1>Console error</h1>
              <p>The UI recovered from an unexpected rendering problem.</p>
            </div>
          </div>
          <div className="card__body stack">
            <p>{this.state.message}</p>
            <Button type="button" onClick={() => this.setState({ hasError: false, message: '' })}>Try again</Button>
          </div>
        </section>
      </main>
    );
  }
}
