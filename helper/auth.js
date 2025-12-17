const jwt = require("jsonwebtoken");
const cds = require("@sap/cds");

async function verifyJWT(req) {
  const expressReq = req._?.req;
  const token = extractTokenFromReq(expressReq || req);

  if (!token) {
    req.reject(401, "Unauthorized: No access token provided");
  }

  let payload;
  try {
    payload = jwt.verify(
      token,
      "jsijf23#@##$@!SDFSD2344$$#@!"
    );
  } catch {
    req.reject(401, "Unauthorized: Invalid or expired access token");
  }

  const userId = payload?._id;
  if (!userId) {
    req.reject(401, "Unauthorized: Invalid token payload");
  }

  const user = await SELECT.one
    .from("my.user.User")
    .where({ ID: userId });

  if (!user) {
    req.reject(401, "Unauthorized: User not found");
  }

  return {
    ID: user.ID,
    email: user.email,
    name: user.name,
  };
}

function extractTokenFromReq(req) {
  if (!req) return null;

  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }

  if (req._?.req?.cookies?.access_token) {
    return req._.req.cookies.access_token;
  }

  return null;
}

module.exports = { verifyJWT };
