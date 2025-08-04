// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import { persistenceMiddleware } from '../reducers/middleware/persistenceMiddleware';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['chat/setAbortController'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.abortController'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.abortControllers'],
      },
    }).concat(persistenceMiddleware),
});