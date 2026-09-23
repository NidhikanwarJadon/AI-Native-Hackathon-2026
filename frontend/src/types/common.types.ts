// App-wide shared TS types. Module-local types (props, DTOs) belong in
// modules/<module>/types/ instead — see the react-development skill.

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
