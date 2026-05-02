export * from './enums';
export * from './dtos';

// API response envelope
export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiFailure {
  success: false;
  statusCode: number;
  error: string;
  path?: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
