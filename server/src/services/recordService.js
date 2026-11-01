import db from '../db/database.js';

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

      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      
      const queryParams = [...params, Number(limit), Number(offset)];

      db.get(countQuery, params, (err, countRow) => {
        if (err) return reject(err);

        db.all(query, queryParams, (err, rows) => {
          if (err) return reject(err);

          resolve({
            total: countRow.total,
            page: Number(page),
            limit: Number(limit),
            data: rows,
          });
        });
      });
    });
  },

  getById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM records WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  create(data) {
    return new Promise((resolve, reject) => {
      const { title, description, category, date } = data;
      const recordDate = date || new Date().toISOString().split('T')[0];

      const query = `INSERT INTO records (title, description, category, date) VALUES (?, ?, ?, ?)`;
      db.run(query, [title, description, category, recordDate], function(err) {
        if (err) return reject(err);
        
        resolve({
          id: this.lastID,
          title,
          description,
          category,
          date: recordDate
        });
      });
    });
  },

  update(id, data) {
    return new Promise((resolve, reject) => {
      const { title, description, category, date } = data;
      
      db.get(`SELECT * FROM records WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        const updatedTitle = title !== undefined ? title : row.title;
        const updatedDesc = description !== undefined ? description : row.description;
        const updatedCat = category !== undefined ? category : row.category;
        const updatedDate = date !== undefined ? date : row.date;

        const query = `UPDATE records SET title = ?, description = ?, category = ?, date = ? WHERE id = ?`;
        db.run(query, [updatedTitle, updatedDesc, updatedCat, updatedDate, id], (err) => {
          if (err) return reject(err);
          resolve({
            id: Number(id),
            title: updatedTitle,
            description: updatedDesc,
            category: updatedCat,
            date: updatedDate
          });
        });
      });
    });
  },

    delete(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM records WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(false);

        db.run(`DELETE FROM records WHERE id = ?`, [id], (err) => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    });
  }
};