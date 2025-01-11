// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import mageReducer from './mageSlice';

export const store = configureStore({
  reducer: {
    mage: mageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
