import pool from '../db/database.js';

const toId = (id) => {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 && value <= 2147483647 ? value : null;
};

export const recordService = {
  async getAll({ page = 1, limit = 10, category, search }) {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }

    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      conditions.push(
        `(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM records ${where}`,
      params
    );

    params.push(limitNumber, (pageNumber - 1) * limitNumber);
    const dataResult = await pool.query(
      `SELECT * FROM records ${where} ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      total: countResult.rows[0].total,
      page: pageNumber,
      limit: limitNumber,
      data: dataResult.rows
    };
  },

  async getById(id) {
    const numericId = toId(id);
    if (numericId === null) return null;
    const { rows } = await pool.query('SELECT * FROM records WHERE id = $1', [numericId]);
    return rows[0] || null;
  },

  async create(data) {
    const date = data.date || new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      'INSERT INTO records (title, description, category, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.title, data.description, data.category, date]
    );
    return rows[0];
  },

  async update(id, data) {
    const numericId = toId(id);
    if (numericId === null) return null;
    const { rows } = await pool.query(
      `UPDATE records
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           date = COALESCE($4, date)
       WHERE id = $5
       RETURNING *`,
      [data.title, data.description, data.category, data.date, numericId]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const numericId = toId(id);
    if (numericId === null) return false;
    const result = await pool.query('DELETE FROM records WHERE id = $1', [numericId]);
    return result.rowCount > 0;
  }
};