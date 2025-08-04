// store/hooks.js
import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Selector hooks for common state selections
export const useChats = () => useAppSelector(state => state.chat.chats);
export const useLoadingStates = () => useAppSelector(state => state.chat.loadingStates);
export const useFileUploadLoading = () => useAppSelector(state => state.chat.fileUploadLoading);
export const useUserInput = () => useAppSelector(state => state.chat.userInput);
export const useSidebarOpen = () => useAppSelector(state => state.chat.sidebarOpen);
export const useDragOver = () => useAppSelector(state => state.chat.dragOver);

// Selector for getting a specific chat
export const useChat = (chatId) => 
  useAppSelector(state => 
    chatId ? state.chat.chats.find(chat => chat.id === chatId) : null
  );

// Selector for getting loading state of a specific chat
export const useChatLoading = (chatId) => 
  useAppSelector(state => 
    chatId ? state.chat.loadingStates[chatId] || false : false
  );

// Selector for getting abort controller of a specific chat
export const useChatAbortController = (chatId) =>
  useAppSelector(state =>
    chatId ? state.chat.abortControllers[chatId] : null
  );