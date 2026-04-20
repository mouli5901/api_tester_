import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import CollectionView from './pages/CollectionView/CollectionView';
import Spinner from './components/Spinner/Spinner';

// Lazy load SharedView to reduce bundle size for authenticated users
const SharedView = lazy(() => import('./pages/SharedView/SharedView'));

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Lazy-loaded Public Route with Suspense Fallback */}
        <Route
          path="/share/:token"
          element={
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Spinner size="lg" />
              </div>
            }>
              <SharedView />
            </Suspense>
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collection/:id" element={<CollectionView />} />
        </Route>

        {/* Catch-all Route: Redirect unknown routes to Dashboard (or Login if unauthenticated) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
