import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

class RouteErrorBoundary extends React.Component<
  { onReset?: () => void; children: React.ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('Admin route error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-2">Terjadi kesalahan</h2>
          <p className="text-sm text-gray-300 mb-4">Halaman admin mengalami error. Coba muat ulang.</p>
          <button onClick={this.reset} className="admin-button">Muat Ulang</button>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const AdminRouteBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Reset boundary when route path changes to avoid stale UI
  return (
    <RouteErrorBoundary key={location.pathname}>
      <Suspense fallback={
        <div className="p-6 text-gray-400">Memuat halaman admin…</div>
      }>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default AdminRouteBoundary;
