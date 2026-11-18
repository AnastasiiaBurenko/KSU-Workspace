import db from '../db/database.js';

export const userService = {
  create(username, passwordHash) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
      db.run(query, [username, passwordHash], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username });
      });
    });
  },

  getByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, password_hash FROM users WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};