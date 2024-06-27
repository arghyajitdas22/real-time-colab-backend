const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; // Make sure to set this in your .env file

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"

  if (!token) return res.sendStatus(401); // Unauthorized if no token is provided

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if the token is invalid
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
