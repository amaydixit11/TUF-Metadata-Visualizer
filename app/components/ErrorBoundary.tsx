'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { styled } from 'styled-components';

const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  max-width: 600px;
  margin: 2rem auto;
  background-color: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ErrorTitle = styled.h2`
  color: var(--fg);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: var(--fg-subtle);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const RetryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo, _: any) {
    console.error('TUF Visualizer caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            We encountered an unexpected error while loading the TUF metadata.
            This could be due to a network issue or a malformed metadata file.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
