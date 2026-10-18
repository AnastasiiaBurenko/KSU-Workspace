export interface RecordItem {
  id: number;
  title: string;
  description: string;
  category: 'schedule' | 'tasks' | 'courses';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'empty';