export interface RecordItem {
  id: number;
  title: string;
  description: string;
  category: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';