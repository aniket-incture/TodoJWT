const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

 function generateRefreshToken(userId) {
  return jwt.sign(
    { _id: userId },
    "sjdfiJ23#@##$@!SDFsD2344$$#@!",
    { expiresIn: "15d" }
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
    "jsijf23#@##$@!SDFSD2344$$#@!",
    { expiresIn: "1d" } 
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken
};
