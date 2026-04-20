import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProtectedRoute.css';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes
  return <Outlet />;
}
