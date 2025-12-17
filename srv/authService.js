const cds = require("@sap/cds");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../helper/utils");
const { verifyJWT } = require("../helper/auth");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
  path: "/",
};

class AuthService extends cds.ApplicationService {
  async init() {
    this.on("register", async (req) => {
      const { email, password, name } = req.data;

      if (!email || !password || !name) {
        req.reject(400, "Email, password and name are required");
      }

      if (typeof password !== "string" || password.length < 6) {
        req.reject(400, "Password should be at least 6 characters long");
      }

      const existing = await SELECT.one.from("my.user.User").where({ email });

      if (existing) {
        req.reject(409, "User already exists");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await INSERT.into("my.user.User").entries({
        email,
        password: passwordHash,
        name,
      });

      return {
        ID: result.ID,
        email,
        name,
      };
    });

    this.on("login", async (req) => {
      const { email, password } = req.data;

      if (!email || !password) {
        req.reject(400, "Email and password are required");
      }

      const user = await SELECT.one.from("my.user.User").where({ email });

      if (!user) {
        req.reject(401, "Invalid email or password");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        req.reject(401, "Invalid email or password");
      }

      const accessToken = generateAccessToken(user.ID);
      const refreshToken = generateRefreshToken(user.ID);
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      await UPDATE("my.user.User")
        .set({ refreshToken: refreshTokenHash })
        .where({ ID: user.ID });

      const res = req._?.res;
      if (!res) {
        req.reject(500, "Internal server error");
      }

      res.cookie("access_token", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        ID: user.ID,
        email: user.email,
        name: user.name,
      };
    });

    this.on("logout", async (req) => {
      let user = null;

      try {
        user = await verifyJWT(req);
      } catch {
        user = null;
      }

      if (user?.ID) {
        await UPDATE("my.user.User")
          .set({ refreshToken: null })
          .where({ ID: user.ID });
      }

      const res = req._?.res;
      if (res) {
        res.clearCookie("access_token", COOKIE_OPTIONS);
        res.clearCookie("refresh_token", COOKIE_OPTIONS);
      }

      return { message: "Logged out" };
    });

    return super.init();
  }
}

module.exports = AuthService;
