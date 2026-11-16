import { recordService } from '../services/recordService.js';

export const recordController = {
  async getRecords(req, res, next) {
    try {
      const { page, limit, category, search } = req.query;
      const result = await recordService.getAll({ page, limit, category, search });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getRecordById(req, res, next) {
    try {
      const record = await recordService.getById(req.params.id);
      if (!record) {
        const error = new Error('Запис не знайдено');
        error.status = 404;
        return next(error);
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async createRecord(req, res, next) {
    try {
      const { title, description, category, date } = req.body;
      const errors = {};

      if (!title || !title.trim()) errors.title = "Поле title є обов'язковим";
      if (!description || !description.trim()) errors.description = "Поле description є обов'язковим";
      if (!category || !category.trim()) errors.category = "Поле category є обов'язковим";

      if (Object.keys(errors).length > 0) {
        return res.status(422).json({
          status: 'error',
          message: 'Помилка валідації вхідних даних',
          errors
        });
      }

      const newRecord = await recordService.create({ title, description, category, date });
      res.status(201).json(newRecord);
    } catch (err) {
      next(err);
    }
  },

  async updateRecord(req, res, next) {
    try {
      const { title, description } = req.body;
      const errors = {};

      if (title !== undefined && title.trim() === '') errors.title = 'Поле title не може бути порожнім';
      if (description !== undefined && description.trim() === '') errors.description = 'Поле description не може бути порожнім';

      if (Object.keys(errors).length > 0) {
        return res.status(422).json({
          status: 'error',
          message: 'Помилка валідації вхідних даних',
          errors
        });
      }

      const updated = await recordService.update(req.params.id, req.body);
      if (!updated) {
        const error = new Error('Запис для оновлення не знайдено');
        error.status = 404;
        return next(error);
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteRecord(req, res, next) {
    try {
      const success = await recordService.delete(req.params.id);
      if (!success) {
        const error = new Error('Запис для видалення не знайдено');
        error.status = 404;
        return next(error);
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};