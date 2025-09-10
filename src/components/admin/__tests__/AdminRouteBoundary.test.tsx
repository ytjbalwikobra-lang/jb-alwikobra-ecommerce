/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRouteBoundary from '../AdminRouteBoundary';

const ProblemChild = () => {
  throw new Error('Test error');
  // eslint-disable-next-line no-unreachable
  return null;
};

const AsyncProblemChild = React.lazy(() => {
  return new Promise<{ default: React.ComponentType }>((resolve) => {
    setTimeout(() => {
      resolve({ default: ProblemChild });
    }, 100);
  });
});

describe('AdminRouteBoundary', () => {
  test('renders children without error', () => {
    render(
      <AdminRouteBoundary>
        <div>Safe Child</div>
      </AdminRouteBoundary>
    );
    expect(screen.getByText('Safe Child')).toBeInTheDocument();
  });

  test('catches error and displays fallback UI', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AdminRouteBoundary>
        <ProblemChild />
      </AdminRouteBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    consoleError.mockRestore();
  });

  test('reset button resets error state', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <AdminRouteBoundary>
        <ProblemChild />
      </AdminRouteBoundary>
    );
    const resetButton = screen.getByText(/Try again/i);
    fireEvent.click(resetButton);
    rerender(
      <AdminRouteBoundary>
        <div>Safe Child</div>
      </AdminRouteBoundary>
    );
    expect(screen.getByText('Safe Child')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  test('displays fallback UI during suspense', async () => {
    render(
      <AdminRouteBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <AsyncProblemChild />
        </React.Suspense>
      </AdminRouteBoundary>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
