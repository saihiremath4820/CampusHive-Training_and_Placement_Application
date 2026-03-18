import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole, userRole }) => {
  const location = useLocation();

  if (!userRole) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to their own dashboard if role doesn't match
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
