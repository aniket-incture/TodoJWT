const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

 function generateRefreshToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

 async function hashRefreshToken(raw) {
  return await bcrypt.hash(raw, 10);
}

 async function verifyRefreshToken(raw, hash) {
  return await bcrypt.compare(raw, hash);
}

 function generateAccessToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" } 
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken
};
