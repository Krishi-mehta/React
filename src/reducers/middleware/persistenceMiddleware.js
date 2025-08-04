// src/reducers/middleware/persistenceMiddleware.js
import { createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to get user-specific storage key
const getUserStorageKey = (userId) => {
  return userId ? `pdfChatApp_chats_${userId}` : 'pdfChatApp_chats_guest';
};

// Load chats from localStorage for specific user
export const initializeChatsFromStorage = createAsyncThunk(
  'chat/initializeChatsFromStorage',
  async (userId, { rejectWithValue }) => {
    try {
      const storageKey = getUserStorageKey(userId);
      const storedChats = localStorage.getItem(storageKey);
      
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        // Filter chats to ensure they belong to the current user
        const userChats = userId 
          ? parsedChats.filter(chat => chat.userId === userId || !chat.userId) // Include legacy chats without userId
          : parsedChats;
        
        return userChats;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to load chats from localStorage:", error);
      // Clear corrupted data
      if (userId) {
        localStorage.removeItem(getUserStorageKey(userId));
      }
      return rejectWithValue([]);
    }
  }
);

// Save chats to localStorage for specific user
export const saveChatsToStorage = (chats, userId) => {
  try {
    const storageKey = getUserStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(chats));
  } catch (error) {
    console.error("Failed to save chats to localStorage:", error);
  }
};

// Middleware to automatically save state changes to localStorage
export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Get the current state after the action
  const state = store.getState();
  
  // Actions that should trigger persistence
  const persistActions = [
    'chat/addChat',
    'chat/updateChatTitle',
    'chat/deleteChat',
    'chat/addMessage',
    'chat/editMessage',
    'chat/updateChatFile',
    'chat/removeChatFile',
    'chat/initializeChatsFromStorage/fulfilled'
  ];
  
  // Check if this action should trigger persistence
  if (persistActions.some(actionType => action.type === actionType)) {
    // Extract user ID from the state or action
    // You might need to adjust this based on your auth state structure
    const userId = state.auth?.currentUser?.uid || state.user?.uid;
    
    // Save the current chats to localStorage
    saveChatsToStorage(state.chat.chats, userId);
  }
  
  return result;
};

// Clean up storage when user logs out
export const clearUserStorage = (userId) => {
  try {
    const storageKey = getUserStorageKey(userId);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear user storage:", error);
  }
};

// Migrate legacy chats to user-specific storage (call this once after login)
export const migrateLegacyChats = (userId) => {
  try {
    const legacyChats = localStorage.getItem('pdfChatApp_chats');
    if (legacyChats && userId) {
      const parsedChats = JSON.parse(legacyChats);
      const userChats = parsedChats.map(chat => ({
        ...chat,
        userId: userId // Add userId to legacy chats
      }));
      
      // Save to user-specific storage
      saveChatsToStorage(userChats, userId);
      
      // Remove legacy storage
      localStorage.removeItem('pdfChatApp_chats');
      
      return userChats;
    }
  } catch (error) {
    console.error("Failed to migrate legacy chats:", error);
  }
  return [];
};