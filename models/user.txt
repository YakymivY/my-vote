const db = require("../util/database");
const bcrypt = require("bcrypt");

class User {
  constructor(id, name, login, password) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.password = password;
  }

  static fetchAll() {
    return db.execute("SELECT * FROM users");
  }

  static fetchByLogin(login) {
    return db.execute("SELECT * FROM users WHERE login = ?", [login]);
  }

  static async create(name, login, password) {
    const hashedPassword = await bcrypt.hash(password, 12);
    return db.execute(
      "INSERT INTO users (name, login, password) VALUES (?, ?, ?)",
      [name, login, hashedPassword]
    );
  }

  static comparePassword(password, storedPassword) {
    return bcrypt.compare(password, storedPassword);
  }
}

module.exports = User;
