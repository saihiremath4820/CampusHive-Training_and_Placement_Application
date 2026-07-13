import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole, userRole }) => {
  const location = useLocation();
  const normalizedUserRole = userRole?.toLowerCase?.();
  const normalizedAllowedRole = allowedRole?.toLowerCase?.();

  if (!normalizedUserRole) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (normalizedAllowedRole && normalizedUserRole !== normalizedAllowedRole) {
    // Redirect to their own dashboard if role doesn't match
    return <Navigate to={`/${normalizedUserRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
