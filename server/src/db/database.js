import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath);

export function initDatabase() {
  return new Promise((resolve, reject) => {
    const query = `
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) > 0),
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `;
    db.run(query, (err) => {
      if (err) {
        console.error('Помилка створення таблиці records:', err.message);
        reject(err);
        return;
      }
      console.log('Таблицю records успішно створено у файлі database.sqlite');
      resolve();
    });
  });
}

export default db;