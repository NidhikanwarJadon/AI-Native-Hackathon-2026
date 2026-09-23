import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { rootReducer, type RootState } from './rootReducer';
import { injectStore } from './client';
import type { AuthState } from '../reducers/authReducer';

// The access token is kept in memory only, not persisted — it's what an XSS
// on this page would want to steal. Only the refresh token survives a
// reload; setup/client.ts already treats "no access token" the same as "an
// expired one" (one 401, one silent refresh), so nothing else has to know.
const authTransform = createTransform<AuthState, AuthState>(
  (inboundState) => ({ ...inboundState, accessToken: null }),
  (outboundState) => outboundState,
  { whitelist: ['auth'] },
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transforms: [authTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

injectStore(store);

export type AppDispatch = typeof store.dispatch;
export type { RootState };

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
