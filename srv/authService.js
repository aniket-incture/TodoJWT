
const cds = require('@sap/cds');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../helper/utils');

module.exports = cds.service.impl(function () {
  this.on('register', async (req) => {
    const { email, password, name } = req.data ;

    if (!email || !password || !name) {
      return req.reject(400, 'Email, password and name are required');
    }
    if (typeof password !== 'string' || password.length < 6) {
      return req.reject(400, 'Password should be at least 6 characters long');
    }

    const tx = cds.tx(req);
     const existing = await tx.run(SELECT.one.from('my.user.User').where({ email }));
      if (existing) return req.reject(409, 'User already exists');

    try {
      
      const passwordHash = await bcrypt.hash(password, 10);

      await tx.run(
        INSERT.into('my.user.User').entries({
          email,
          password: passwordHash,
          name,
        })
      );

      const user = await tx.run(SELECT.one.from('my.user.User').where({ email }));
      if (!user) return req.reject(500, 'Failed to create user');

      return { ID: user.ID, email: user.email, name: user.name };
    } catch (err) {
     
      console.error('auth.register error:', err && (err.stack || err));
      return req.reject(500, 'Registration failed');
    }
  });

  this.on('login', async (req) => {
  const { email, password } = req.data;
  if (!email || !password) {
    return req.reject(400, 'Email and password are required');
  }

  const tx = cds.tx(req);
  const user = await tx.run(SELECT.one.from('my.user.User').where({ email }));
  if (!user) return req.reject(401, 'Invalid email or password');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return req.reject(401, 'Invalid email or password');

  const accessToken = generateAccessToken(user.ID);
  const refreshToken = generateRefreshToken(user.ID);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await tx.run(
    UPDATE('my.user.User')
      .set({ refreshToken: refreshTokenHash })
      .where({ ID: user.ID })
  );

  const res = req._.res;
  if (!res) {
    console.error("Cannot access Express res object");
    return req.reject(500, "Internal server error");
  }
console.log("Setting cookies for user:", user.email);
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,        
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000 
  });
  console.log("Access token cookie set for user:", user.email);
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
console.log("Login successful for user:", user.email);
  return { ID: user.ID, email: user.email, name: user.name };
});

});
