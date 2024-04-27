const db = require("../util/database");

class Session {
  constructor(id, user_id, token, expires_at) {
    this.id = id;
    this.user_id = user_id;
    this.token = token;
    this.expires_at = expires_at;
  }

  static fetchByUser(user_id) {
    return db.execute("SELECT * FROM sessions WHERE user_id = ?", [user_id]);
  }

  static create(user_id, token, expires_at) {
    return db.execute(
      "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user_id, token, expires_at]
    );
  }

  static deleteByUser(user_id) {
    return db.execute("DELETE FROM sessions WHERE user_id = ?", [user_id]);
  }

  static fetchByToken(token) {
    return db.execute("SELECT * FROM sessions WHERE token = ?", [token]);
  }
}

module.exports = Session;
