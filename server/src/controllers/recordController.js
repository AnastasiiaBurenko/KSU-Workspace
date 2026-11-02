import { recordService } from '../services/recordService.js';
export const recordController = {
  async getRecords(req, res, next) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const result = await recordService.getAll(page, limit, category, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async createRecord(req, res, next) {
    try {
      const { title, description, category, date } = req.body;
      const errors = {};
  if (!title || !title.trim()) {
    errors.title = 'Поле title є обов’язковим';
  }

  if (!description || !description.trim()) {
    errors.description = 'Поле description є обов’язковим';
  }

  if (!category || !category.trim()) {
    errors.category = 'Поле category є обов’язковим';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'Помилка валідації вхідних даних',
      errors,
    });
  }

  const newRecord = await recordService.create({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    date,
  });

  res.status(201).json(newRecord);
} catch (error) {
  next(error);
}
  },
  async updateRecord(req, res, next) {
    try {
      const { title, description, category, date } = req.body;
      const errors = {};
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    errors.title = 'Поле title не може бути порожнім';
  }

  if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
    errors.description = 'Поле description не може бути порожнім';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'Помилка валідації вхідних даних',
      errors,
    });
  }

  const updated = await recordService.update(req.params.id, {
    title,
    description,
    category,
    date,
  });

  if (!updated) {
    return res.status(404).json({ message: 'Запис для оновлення не знайдено' });
  }

  res.json(updated);
} catch (error) {
  next(error);
}
  },
  async deleteRecord(req, res, next) {
    try {
      const result = await recordService.delete(req.params.id);
  if (!result.deleted) {
    return res.status(404).json({ message: 'Запис для видалення не знайдено' });
  }

  res.status(204).send();
} catch (error) {
  next(error);
}
  },
};