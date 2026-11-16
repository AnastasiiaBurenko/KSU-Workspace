import db from '../db/database.js';

export const recordService = {
  getAll({ page = 1, limit = 10, category, search }) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM records WHERE 1=1`;
      const params = [];

      if (category && category !== 'all') {
        query += ` AND LOWER(category) = LOWER(?)`;
        params.push(category);
      }

      if (search) {
        query += ` AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)`;
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);

        db.get(`SELECT COUNT(*) as total FROM records`, [], (errCount, countResult) => {
          if (errCount) return reject(errCount);

          resolve({
            total: countResult.total,
            page: Number(page),
            limit: Number(limit),
            data: rows
          });
        });
      });
    });
  },

  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  create(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO records (title, description, category, date)
        VALUES (?, ?, ?, ?)
      `;
      const dateStr = data.date || new Date().toISOString().split('T')[0];
      const params = [data.title, data.description, data.category, dateStr];

      db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({
          id: this.lastID,
          title: data.title,
          description: data.description,
          category: data.category,
          date: dateStr
        });
      });
    });
  },

  update(id, data) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE records
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            category = COALESCE(?, category),
            date = COALESCE(?, date)
        WHERE id = ?
      `;
      const params = [data.title, data.description, data.category, data.date, id];

      db.run(query, params, function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);
        resolve({ id: Number(id), ...data });
      });
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM records WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
};