import { db } from '../db/database.js';

export const recordService = {
  getAll(page = 1, limit = 10, category, search) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM records WHERE 1=1`;
      let countQuery = `SELECT COUNT(*) as total FROM records WHERE 1=1`;
      const params = [];

      if (category && category !== 'all') {
        query += ` AND category = ?`;
        countQuery += ` AND category = ?`;
        params.push(category);
      }

      if (search) {
        query += ` AND (title LIKE ? OR description LIKE ?)`;
        countQuery += ` AND (title LIKE ? OR description LIKE ?)`;
        const searchQuery = `%${search}%`;
        params.push(searchQuery, searchQuery);
      }

      const numLimit = Number(limit) || 10;
      const numOffset = (Number(page) - 1) * numLimit;

      query += ` LIMIT ${numLimit} OFFSET ${numOffset}`;

      db.get(countQuery, params, (err, countRow) => {
        if (err) return reject(err);

        db.all(query, params, (err, rows) => {
          if (err) return reject(err);
          resolve({
            total: countRow ? countRow.total : 0,
            page: Number(page),
            limit: numLimit,
            data: rows,
          });
        });
      });
    });
  },

  create(data) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO records (title, description, category, date) VALUES (?, ?, ?, ?)`;
      const params = [
        data.title,
        data.description,
        data.category,
        data.date || new Date().toISOString().split('T')[0]
      ];

      db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  },

  update(id, data) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE records SET title = ?, description = ?, category = ?, date = ? WHERE id = ?`;
      const params = [data.title, data.description, data.category, data.date, id];

      db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ id: Number(id), ...data });
      });
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM records WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve({ deleted: this.changes > 0 });
      });
    });
  }
};