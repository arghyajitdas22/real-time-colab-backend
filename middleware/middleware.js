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

const { StatusCodes } = require("http-status-codes");

module.exports.authenticate = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Access denied. No token provided.",
      status: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Invalid token.",
      status: false,
    });
  }
};


module.exports = authenticateToken;
