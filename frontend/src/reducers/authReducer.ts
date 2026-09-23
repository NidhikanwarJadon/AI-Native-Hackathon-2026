import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ScreenPermission } from '../constants/permissions';

export interface AuthState {
  accessToken: string | null;
  // role/permissions: the backend has no role concept yet ("there is no role
  // column yet", per backend/app/routers/users.py) — these stay at their
  // initial values until it does. Kept as real fields (not removed) because
  // useFetchAPI reads state.auth.role for every call's dependency array.
  role: string | null;
  permissions: ScreenPermission[];
}

const initialState: AuthState = {
  accessToken: null,
  role: null,
  permissions: [],
};

interface Session {
  accessToken: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dispatched by useLogin on a successful call. The backend's login
    // response is just { access_token, token_type } — no refresh token, no
    // role/permissions — so this is all there is to store.
    sessionStarted: (state, action: PayloadAction<Session>) => {
      state.accessToken = action.payload.accessToken;
    },
    // setup/rootReducer.ts matches every dispatched action's type against
    // this one and, on a match, resets the entire store, not just auth.
    logout: () => initialState,
  },
});

export const { sessionStarted, logout } = authSlice.actions;
export default authSlice.reducer;
