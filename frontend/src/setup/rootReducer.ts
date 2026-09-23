import { combineReducers, type UnknownAction } from '@reduxjs/toolkit';
import authReducer, { logout } from '../reducers/authReducer';

const appReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof appReducer>;

// On logout, resetting state to undefined makes every slice re-initialize to
// its own initialState, so no individual slice can forget to reset.
export const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};
