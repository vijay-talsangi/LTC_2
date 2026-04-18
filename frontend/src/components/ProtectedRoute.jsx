import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects a group of routes by role.
 * Usage:
 *   <Route element={<ProtectedRoute roles={['admin']} />}>
 *     <Route path="/admin" element={<Dashboard />} />
 *   </Route>
 */
const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
