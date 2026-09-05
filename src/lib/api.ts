const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString() || "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = localStorage.getItem('mitao_access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (could implement silent refresh here later)
  if (response.status === 401) {
    localStorage.removeItem('mitao_access_token');
    localStorage.removeItem('mitao_refresh_token');
    // Optional: trigger a global event or redirect to login
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || 'An unexpected error occurred',
      data?.details
    );
  }

  return data as T;
}
