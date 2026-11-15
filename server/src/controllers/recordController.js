import bcrypt from 'bcrypt';
import db from '../db/database.js';

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Введіть ім'я користувача та пароль" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

        db.run(query, [username, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ message: "Користувач вже існує" });
            }
            res.status(201).json({ message: "Реєстрація успішна", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const query = `SELECT * FROM users WHERE username = ?`;

        db.get(query, [username], async (err, user) => {
            if (err || !user) {
                return res.status(401).json({ message: "Невірний логін або пароль" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Невірний логін або пароль" });
            }

            res.status(200).json({ message: "Успішний вхід", username: user.username });
        });
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера", error: error.message });
    }
};