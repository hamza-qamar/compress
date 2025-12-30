export type AppState = 'idle' | 'review' | 'processing' | 'complete';

export type FileStatus = 'pending' | 'processing' | 'done' | 'error' | 'warning';

export interface QueueItem {
  id: string;
  file: File;
  status: FileStatus;
  originalSize: number;
  compressedSize: number | null;
  data: Blob | null;
  errorMsg?: string;
}

export type CompressionConfig = {
  targetSizeKB: number;
};
