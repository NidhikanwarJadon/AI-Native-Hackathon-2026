// Extracted directly from backend/app/schemas/user_schema.py — docs/architecture.md
// is still an empty placeholder, so this is the actual wire contract rather than
// an assumption. Field names are snake_case because FastAPI/Pydantic doesn't
// transform casing by default; these are exactly what's sent and received.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

// The bearer token login returns. No refresh token — the backend has no
// refresh endpoint, so a 401 always means "log in again", never "retry".
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// UserOut — what register returns. Registration does NOT log the user in;
// it only creates the account (matches backend/app/routers/auth.py's own
// comment: "Self-service signup is POST /api/auth/register" is a separate
// concern from issuing a token).
export interface RegisterResponse {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
