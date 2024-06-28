const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY; // Make sure to set this in your .env file
const { StatusCodes } = require("http-status-codes");

const authenticateToken = (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "No token",
      status: false,
    });
  }

  const token = authHeaders.split(" ")[1];

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = { user_id: payload.user_id };
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Invalid Token",
      status: false,
    });
  }
};

const authenticate = (req, res, next) => {
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

module.exports = { authenticateToken, authenticate };
