const { Store } = require("express-session");
const db = require("../util/database");

class SessionStore extends Store {
  constructor(options) {
    super(options);
  }

  async get(sid, callback) {
    try {
      const [rows] = await db.query("SELECT * FROM sessions WHERE id = ?", [sid]);

      if (rows.length === 0) {
        return callback(null, null);
      }

      const session = JSON.parse(rows[0].data);
      session.cookie = {
        originalMaxAge: null,
        expires: null,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      };

      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, session, callback) {
    try {
      const data = JSON.stringify(session);
      const expiresAt = new Date(Date.now() + session.cookie.originalMaxAge * 1000);

      await db.query("INSERT INTO sessions (id, user_id, data, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, expires_at = ?", [sid, session.userId, data, expiresAt, data, expiresAt]);

      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await db.query("DELETE FROM sessions WHERE id = ?", [sid]);

      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = SessionStore;
