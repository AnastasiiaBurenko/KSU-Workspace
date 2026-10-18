import { RecordItem } from './types';

export function isValidRecordItem(item: unknown): item is RecordItem {
  if (typeof item !== 'object' || item === null) return false;
  
  const record = item as Record<string, unknown>;
  
  return (
    typeof record.id === 'number' &&
    typeof record.title === 'string' &&
    typeof record.description === 'string' &&
    (record.category === 'schedule' || record.category === 'tasks' || record.category === 'courses')
  );
}

export function validateRecords(data: unknown): RecordItem[] {
  if (!Array.isArray(data)) {
    throw new Error('Отримані дані не є масивом');
  }
  
  return data.filter(isValidRecordItem);
}