/**
 * adminOnly middleware — secures administrative routes.
 * Must be executed AFTER the protect middleware so req.user is populated.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrator privileges required' });
  }
};

module.exports = { adminOnly };
