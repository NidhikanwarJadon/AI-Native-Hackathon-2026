import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApiStatus } from '../setup/apiStatus';
import type { ScreenPermission } from '../constants/permissions';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  // Read by useFetchAPI, which appends it to every dependency array so a role
  // change refetches the screen's data.
  role: string | null;
  permissions: ScreenPermission[];
  status: ApiStatus;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  permissions: [],
  status: ApiStatus.IDLE,
  error: null,
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role?: string;
  permissions?: ScreenPermission[];
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role ?? state.role;
      state.permissions = action.payload.permissions ?? state.permissions;
      state.status = ApiStatus.SUCCEEDED;
      state.error = null;
    },
    // Dispatched once, centrally, on logout — see setup/rootReducer.ts, which resets
    // every slice back to its initialState when this action fires.
    logout: () => initialState,
    // Local reset, e.g. dispatched by a modal on close. Logout already covers the
    // global wipe; this is here so every slice exports the same local-reset shape.
    resetAuthState: () => initialState,
  },
});

export const { setAuthTokens, logout, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
