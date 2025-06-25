export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: string[];
}
