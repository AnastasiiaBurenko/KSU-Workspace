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