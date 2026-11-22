import pool from '../db/database.js';

export const userService = {
  async create(username, passwordHash) {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );
    return rows[0];
  },

  async getByUsername(username) {
    const { rows } = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    return rows[0] || null;
  }
};