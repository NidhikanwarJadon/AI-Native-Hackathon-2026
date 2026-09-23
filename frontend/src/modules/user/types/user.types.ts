// Module-local types for the user-list screen.
// Assumed minimal shape — no real entity/architecture doc exists yet.

export interface UserDto {
  id: string;
  name: string;
  email: string;
}

export interface UserListParams {
  page: number;
  pageSize: number;
}
