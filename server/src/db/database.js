import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Помилка підключення до бази даних SQLite:', err.message);
  } else {
    console.log('📦 Підключено до бази даних SQLite успішно.');
  }
});

export const initDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) > 0),
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Курси', 'Матеріали', 'Проєкти', 'schedule', 'tasks', 'courses')),
        date TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
    `);
    
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_records_title ON records(title);
    `);
  });
};

export default db;