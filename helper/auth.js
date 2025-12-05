const jwt = require('jsonwebtoken');
const cds = require('@sap/cds');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function verifyJWT(req) {
  const expressReq = req._ && req._.req;

  const token = extractTokenFromReq(expressReq || req);
console.log("Extracted token:", token);
  if (!token) return req.reject(401, 'Unauthorized: No access token provided');

  let payload;
  try {
    payload = jwt.verify(token, ACCESS_SECRET);
  } catch {
    return req.reject(401, 'Unauthorized: Invalid or expired access token');
  }
console.log("JWT payload:", payload);
  const userId = payload._id ;
  if (!userId) return req.reject(401, 'Unauthorized: Invalid token payload');

  const tx = cds.tx(req);
  const user = await tx.run(
    SELECT.one.from('my.user.User').where({ ID: userId })
  );

  if (!user) return req.reject(401, 'Unauthorized: User not found');

  req.user = {
    ID: user.ID,
    email: user.email,
    name: user.name,
  };

  return req.user;
}

function extractTokenFromReq(req) {
    console.log("Cookies from req",req)
  if (!req) return null;

  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  if (req._ && req._.req && req._.req.cookies && req._.req.cookies.access_token) {
    return req._.req.cookies.access_token;
  }

  return null;
}

module.exports = { verifyJWT };
