import express from 'express';
import db from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
    db.all(`SELECT * FROM records`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ records: rows });
    });
});

router.post('/', (req, res) => {
    const { title, description, category, date } = req.body;
    if (!title) return res.status(400).json({ message: 'Поле title є обов’язковим' });

    const query = `INSERT INTO records (title, description, category, date) VALUES (?, ?, ?, ?)`;
    db.run(query, [title, description, category, date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, description, category, date });
    });
});

export default router;