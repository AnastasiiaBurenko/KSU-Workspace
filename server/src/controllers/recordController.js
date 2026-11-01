import { recordService } from '../services/recordService.js';

export const recordController = {
  getRecords(req, res) {
    const { page = 1, limit = 10, category, search } = req.query;
    const result = recordService.getAll(page, limit, category, search);
    res.json(result);
  },

  getRecordById(req, res, next) {
    const record = recordService.getById(req.params.id);
    if (!record) {
      const error = new Error('Запис не знайдено');
      error.status = 404;
      return next(error);
    }
    res.json(record);
  },

  createRecord(req, res, next) {
    const { title, description, category } = req.body;
    const errors = {};

    if (!title || title.trim() === '') errors.title = 'Поле title є обов’язковим';
    if (!description || description.trim() === '') errors.description = 'Поле description є обов’язковим';
    if (!category || category.trim() === '') errors.category = 'Поле category є обов’язковим';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'Помилка валідації вхідних даних',
        errors,
      });
    }

    const newRecord = recordService.create({ title, description, category });
    res.status(201).json(newRecord);
  },

  updateRecord(req, res, next) {
    const { title, description } = req.body;
    const errors = {};

    if (title !== undefined && title.trim() === '') errors.title = 'Поле title не може бути порожнім';
    if (description !== undefined && description.trim() === '') errors.description = 'Поле description не може бути порожнім';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'Помилка валідації вхідних даних',
        errors,
      });
    }

    const updated = recordService.update(req.params.id, req.body);
    if (!updated) {
      const error = new Error('Запис для оновлення не знайдено');
      error.status = 404;
      return next(error);
    }

    res.json(updated);
  },

  deleteRecord(req, res, next) {
    const success = recordService.delete(req.params.id);
    if (!success) {
      const error = new Error('Запис для видалення не знайдено');
      error.status = 404;
      return next(error);
    }
    res.status(204).send();
  },
};