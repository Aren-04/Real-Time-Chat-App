const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Expecting header: Authorization: Bearer <token>
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Safely split and extract token

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user payload
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
