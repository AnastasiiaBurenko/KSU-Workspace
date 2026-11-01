import { recordsData } from '../data/recordsStore.js';

export const recordService = {
  getAll(page = 1, limit = 10, category, search) {
    let result = [...recordsData];

    if (category && category !== 'all') {
      result = result.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query)
      );
    }

    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + Number(limit));

    return {
      total: result.length,
      page: Number(page),
      limit: Number(limit),
      data: paginatedItems,
    };
  },

  getById(id) {
    return recordsData.find(r => r.id === Number(id));
  },

  create(data) {
    const newRecord = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date || new Date().toISOString().split('T')[0],
    };
    recordsData.unshift(newRecord);
    return newRecord;
  },

  update(id, data) {
    const index = recordsData.findIndex(r => r.id === Number(id));
    if (index === -1) return null;

    recordsData[index] = {
      ...recordsData[index],
      ...data,
      id: Number(id),
    };
    return recordsData[index];
  },

  delete(id) {
    const index = recordsData.findIndex(r => r.id === Number(id));
    if (index === -1) return false;
    recordsData.splice(index, 1);
    return true;
  },
};