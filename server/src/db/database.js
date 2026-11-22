import pg from 'pg';
import { config } from '../config/config.js';

if (!config.databaseUrl) {
  console.error('Не задано DATABASE_URL у змінних середовища');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

pool.on('error', (err) => {
  console.error('Помилка з’єднання з базою:', err.message);
});

const SAMPLE_RECORDS = [
  ['Веб-програмування', 'Лабораторна робота онлайн. Викладач: Лемещук О.І.', 'Курси', '2026-10-28'],
  ['Кар’єрні навички', 'Проходження модулів та тестування на платформі Strum. Викладач: Кобець В.М.', 'Матеріали', '2026-10-25'],
  ['Алгоритми і структури даних', 'Виконання практичної роботи. Викладач: Львов М.С.', 'Проєкти', '2026-10-22']
];

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(title) > 0),
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE CHECK (length(username) >= 3),
      password_hash TEXT NOT NULL
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_records_category ON records (category)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_records_title ON records (title)');

  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM records');
  if (rows[0].total === 0) {
    for (const [title, description, category, date] of SAMPLE_RECORDS) {
      await pool.query(
        'INSERT INTO records (title, description, category, date) VALUES ($1, $2, $3, $4)',
        [title, description, category, date]
      );
    }
  }

  console.log('Таблиці records і users готові в базі Neon (PostgreSQL)');
}

export default pool;