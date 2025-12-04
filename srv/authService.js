
const cds = require('@sap/cds');
const bcrypt = require('bcryptjs');

module.exports = cds.service.impl(function () {
  this.on('register', async (req) => {
    const { email, password, name } = req.data || {};

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
      
      const SALT_ROUNDS = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

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
});
