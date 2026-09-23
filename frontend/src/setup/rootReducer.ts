import { combineReducers, type UnknownAction } from '@reduxjs/toolkit';
import authReducer, { logout } from '../reducers/authReducer';

const appReducer = combineReducers({
  auth: authReducer,
  // Register each new feature slice here as it's added, under its state key.
});

export type RootState = ReturnType<typeof appReducer>;

// Centralised reset-on-logout: clearing the persisted state and returning every
// slice to its initialState here means no individual slice can forget to reset.
export const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};
