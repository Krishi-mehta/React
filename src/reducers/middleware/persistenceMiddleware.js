// src/reducers/middleware/persistenceMiddleware.js
import { createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to convert File to serializable format
const serializeFile = async (file) => {
  if (!file) return null;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: reader.result // base64 data URL
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to deserialize file data
const deserializeFile = (serializedFile) => {
  if (!serializedFile) return null;
  
  // Return an object that mimics File properties but with the base64 data
  return {
    name: serializedFile.name,
    type: serializedFile.type,
    size: serializedFile.size,
    lastModified: serializedFile.lastModified,
    data: serializedFile.data // base64 data URL for preview
  };
};

// Helper function to serialize chats with file data
const serializeChatsForStorage = async (chats) => {
  const serializedChats = [];
  
  for (const chat of chats) {
    const serializedChat = { ...chat };
    
    // Serialize file if it exists and is a File object
    if (chat.file && chat.file instanceof File) {
      try {
        serializedChat.file = await serializeFile(chat.file);
      } catch (error) {
        console.error('Failed to serialize file for chat:', chat.id, error);
        serializedChat.file = null;
      }
    }
    
    serializedChats.push(serializedChat);
  }
  
  return serializedChats;
};

// Helper function to deserialize chats with file data
const deserializeChatsFromStorage = (chats) => {
  return chats.map(chat => {
    const deserializedChat = { ...chat };
    
    // Deserialize file if it exists
    if (chat.file && typeof chat.file === 'object' && chat.file.data) {
      deserializedChat.file = deserializeFile(chat.file);
    }
    
    return deserializedChat;
  });
};

// Helper function to get user-specific storage key
const getUserStorageKey = (userId) => {
  return userId ? `pdfChatApp_chats_${userId}` : 'pdfChatApp_chats_guest';
};

// Helper function to get user-specific language storage key
const getUserLanguageKey = (userId) => {
  return userId ? `pdfChatApp_language_${userId}` : 'pdfChatApp_language_guest';
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
        
        // Deserialize file data
        const deserializedChats = deserializeChatsFromStorage(userChats);
        
        return deserializedChats;
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
export const saveChatsToStorage = async (chats, userId) => {
  try {
    const storageKey = getUserStorageKey(userId);
    
    // Serialize chats with file data
    const serializedChats = await serializeChatsForStorage(chats);
    
    localStorage.setItem(storageKey, JSON.stringify(serializedChats));
  } catch (error) {
    console.error("Failed to save chats to localStorage:", error);
  }
};

// Save language preference to localStorage for specific user
export const saveLanguageToStorage = (language, userId) => {
  try {
    const languageKey = getUserLanguageKey(userId);
    localStorage.setItem(languageKey, language);
  } catch (error) {
    console.error("Failed to save language to localStorage:", error);
  }
};

// Load language preference from localStorage for specific user
export const loadLanguageFromStorage = (userId) => {
  try {
    const languageKey = getUserLanguageKey(userId);
    const storedLanguage = localStorage.getItem(languageKey);
    return storedLanguage || 'English';
  } catch (error) {
    console.error("Failed to load language from localStorage:", error);
    return 'English';
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

  // Actions that should trigger language persistence
  const languagePersistActions = [
    'chat/setSelectedLanguage'
  ];
  
  // Check if this action should trigger persistence
  if (persistActions.some(actionType => action.type === actionType)) {
    // Extract user ID from the state or action
    // You might need to adjust this based on your auth state structure
    const userId = state.auth?.currentUser?.uid || state.user?.uid;
    
    // Save the current chats to localStorage (async but don't wait)
    saveChatsToStorage(state.chat.chats, userId).catch(error => {
      console.error('Failed to persist chats:', error);
    });
  }

  // Check if this action should trigger language persistence
  if (languagePersistActions.some(actionType => action.type === actionType)) {
    // Extract user ID from the state or action
    const userId = state.auth?.currentUser?.uid || state.user?.uid;
    
    // Save the current language to localStorage
    saveLanguageToStorage(state.chat.selectedLanguage, userId);
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