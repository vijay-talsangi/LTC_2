/**
 * Role-Based Authorization Middleware
 * Usage: router.use(authenticate, authorize('admin', 'faculty'))
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
