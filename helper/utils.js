const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

export function generateRefreshToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

export async function hashRefreshToken(raw) {
  return await bcrypt.hash(raw, 10);
}

export async function verifyRefreshToken(raw, hash) {
  return await bcrypt.compare(raw, hash);
}

export function generateAccessToken(userId) {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } 
  );
}
