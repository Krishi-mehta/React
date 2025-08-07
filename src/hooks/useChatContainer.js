import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { 
    useAppDispatch,
     useChats, 
     useFileUploadLoading, 
     useUserInput, 
     useSidebarOpen, 
     useDragOver, 
     useChat, 
     useChatLoading, 
     useChatAbortController, 
     useSelectedLanguage}
    from "../reducers/hooks";
import { 
    addChat, 
    updateChatTitle,
    addMessage,
    deleteChat, 
    updateMessages, // Make sure this is imported
    editMessage,
    setFileUploadLoading, 
    setUserInput, 
    setSidebarOpen, 
    setDragOver, 
    updateChatFile, 
    removeChatFile, 
    setAbortController, 
    clearAbortController, 
    sendMessageToAI, 
    setSelectedLanguage }
    from "../store/slices/chatSlice";
import { initializeChatsFromStorage, loadLanguageFromStorage } from "../reducers/middleware/persistenceMiddleware";
import { useTheme,useMediaQuery } from "@mui/material";
import { changeLanguage } from "../i18n";
import { v4 as uuidv4 } from "uuid";
import { extractTextFromFile, processFileInBackground } from "../utils/fileProcessing";

const OPENROUTER_CONFIG = {
  apiKey: import.meta.env.VITE_API_KEY,
  baseUrl: "https://openrouter.ai/api/v1",
  model: "deepseek/deepseek-r1-0528:free",
  siteUrl: window.location.origin,
  siteName: "PDF Chat App",
};

export function useChatContainer({ mode, setMode }) {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chats = useChats();
  const fileUploadLoading = useFileUploadLoading();
  const userInput = useUserInput();
  const sidebarOpen = useSidebarOpen();
  const dragOver = useDragOver();
  const selectedLanguage = useSelectedLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { chatId } = useParams();
  const isNewChatPath = chatId === "new";
  const currentChat = useChat(chatId);
  const currentChatLoading = useChatLoading(chatId);
  const currentAbortController = useChatAbortController(chatId);

  useEffect(() => {
    if (currentUser) {
      dispatch(initializeChatsFromStorage(currentUser.uid));
      const savedLanguage = loadLanguageFromStorage(currentUser.uid);
      if (savedLanguage !== selectedLanguage) {
        dispatch(setSelectedLanguage(savedLanguage));
      }
    }
  }, [dispatch, currentUser, selectedLanguage]);

  const stopGeneration = useCallback(() => {
    if (currentAbortController) {
      currentAbortController.abort();
      dispatch(clearAbortController(chatId));
    }
  }, [currentAbortController, chatId, dispatch]);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    const MAX_FILE_SIZE_MB = 15;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(t('file.fileTooLarge'));
        return;
      }

      dispatch(setFileUploadLoading(true));
      dispatch(setUserInput(""));

      try {
        // Get placeholder text immediately for instant loading
        const placeholderText = await extractTextFromFile(file, true);
        const newChatId = uuidv4();
        const defaultTitle =
          file.name.length > 25
            ? file.name.substring(0, 22) + "..."
            : file.name;

        // Create a Blob URL for the file to use in preview
        const fileBlob = new Blob([file], { type: file.type });
        const fileURL = URL.createObjectURL(fileBlob);
        
        // Convert file to base64 for localStorage persistence
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const newChat = {
          id: newChatId,
          title: defaultTitle,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            isImage: file.type.startsWith('image/'), // Track if it's an image
            data: fileData, // Store base64 data URL for preview and persistence
          },
          fullText: placeholderText,
          messages: [
            {
              sender: 'ai',
              text: file.type.startsWith('image/')
                ? '🖼️ I can see you\'ve uploaded an image! I\'m currently analyzing it to extract any text and understand the visual content. This may take a moment. Once processing is complete, you can ask me questions about what\'s in the image.'
                : '📄 I can see you\'ve uploaded a document! I\'m currently processing it to extract the text content. This may take a moment. Once processing is complete, you can ask me questions about the document.'
            }
          ],
          userId: currentUser?.uid,
          processingComplete: false, // Mark as still processing
          processingError: false,
        };

        // Add chat immediately with placeholder
        dispatch(addChat(newChat));
        navigate(`/chat/${newChatId}`);

        // Start background processing
        processFileInBackground(file, newChatId, dispatch, updateChatFile, addMessage);

      } catch (error) {
        console.error("Error processing file:", error);
        alert(t('file.fileProcessingError') + ": " + error.message);
      } finally {
        dispatch(setFileUploadLoading(false));
      }
  }, [dispatch, navigate, currentUser]);

  const handleFileInputChange = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Updated to allow images
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert(t('file.unsupportedFormat'));
        event.target.value = null;
        return;
      }

      await handleFileUpload(file);
      event.target.value = null;
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    dispatch(setDragOver(true));
  }, [dispatch]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dispatch(setDragOver(false));
  }, [dispatch]);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      dispatch(setDragOver(false));

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        
        if (allowedExtensions.includes(fileExtension) || file.type.startsWith('image/')) {
          await handleFileUpload(file);
        } else {
          alert(t('file.unsupportedFormat'));
        }
      }
    },
    [handleFileUpload, dispatch]
  );

  const [editingMessageIndex, setEditingMessageIndex] = useState(null);

  const handleEditMessage = useCallback(
    async (messageIndex, messageText) => {
      if (!currentChat || !chatId) return;

      // Set the message text in the input for editing
      dispatch(setUserInput(messageText));
      
      // Store which message we're editing
      setEditingMessageIndex(messageIndex);
    },
    [currentChat, chatId, dispatch]
  );

   const onSendMessage = useCallback(async () => {
    if (!userInput.trim() || currentChatLoading || !currentChat || !chatId)
      return;

    // Check if API key is configured
    if (!OPENROUTER_CONFIG.apiKey) {
      alert(
        t('errors.general') + ": " + t('errors.unauthorized')
      );
      return;
    }

    const messageToSend = userInput;
    dispatch(setUserInput(""));

    // Check if we're editing an existing message
    if (editingMessageIndex !== null) {
      // We're editing - replace the message at the specific index
      const updatedMessages = [...currentChat.messages];
      updatedMessages[editingMessageIndex] = { sender: "user", text: messageToSend };
      
      // Remove any AI response that comes after this message
      const nextMessageIndex = editingMessageIndex + 1;
      if (nextMessageIndex < updatedMessages.length && updatedMessages[nextMessageIndex].sender === 'ai') {
        // Remove the old AI response
        updatedMessages.splice(nextMessageIndex, 1);
      }
      
      // Update the messages
      dispatch(updateMessages({ chatId, messages: updatedMessages }));
      
      // Clear editing state
      setEditingMessageIndex(null);
      
      try {
        // Generate new AI response for the edited message
        const thunkAction = sendMessageToAI({
          message: messageToSend,
          chatId,
          documentText: currentChat.fullText,
          chatHistory: updatedMessages.slice(0, editingMessageIndex), // Messages before the edited one
          apiConfig: OPENROUTER_CONFIG,
          isImageChat: currentChat.file?.isImage || false,
          selectedLanguage,
        });

        const thunkPromise = dispatch(thunkAction);
        dispatch(setAbortController({ chatId, abortController: thunkPromise }));
        await thunkPromise;
      } catch (error) {
        console.error("Error getting updated AI response:", error);
      }
    } else {
      // Normal new message flow
      // Add user message to chat
      dispatch(addMessage({
        chatId,
        message: { sender: "user", text: messageToSend }
      }));

      try {
        // Dispatch the async thunk and store the thunk action
        const thunkAction = sendMessageToAI({
          message: messageToSend,
          chatId,
          documentText: currentChat.fullText,
          chatHistory: currentChat.messages,
          apiConfig: OPENROUTER_CONFIG,
          isImageChat: currentChat.file?.isImage || false,
          selectedLanguage,
        });

        const thunkPromise = dispatch(thunkAction);
        dispatch(setAbortController({ chatId, abortController: thunkPromise }));
        await thunkPromise;
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }, [
    userInput,
    currentChatLoading,
    chatId,
    currentChat,
    dispatch,
    selectedLanguage,
    t,
    editingMessageIndex
  ]);

  const handleNewChat = useCallback(() => {
    navigate("/chat/new");
    dispatch(setUserInput(""));
    setEditingMessageIndex(null); // Clear editing state
    if (isMobile) dispatch(setSidebarOpen(false));
  }, [navigate, isMobile, dispatch]);

  const handleChatSelect = useCallback((id) => {
    navigate(`/chat/${id}`);
    dispatch(setUserInput(""));
    setEditingMessageIndex(null); // Clear editing state
    if (isMobile) dispatch(setSidebarOpen(false));
  }, [navigate, isMobile, dispatch]);

  const handleEditChatTitle = useCallback((id, newTitle) => {
    dispatch(updateChatTitle({ chatId: id, title: newTitle }));
  }, [dispatch]);

  const handleDeleteChat = useCallback((idToDelete) => {
    dispatch(deleteChat(idToDelete));
    if (chatId === idToDelete) {
      navigate("/chat/new");
    }
  }, [navigate, chatId, dispatch]);

  const handleRemoveFile = useCallback(() => {
    if (currentChat) {
      dispatch(removeChatFile(chatId));
      navigate("/chat/new");
    }
  }, [currentChat, chatId, dispatch, navigate]);

  const handleLanguageChange = useCallback((newLanguage) => {
    dispatch(setSelectedLanguage(newLanguage));
    changeLanguage(newLanguage);
  }, [dispatch]);

  // Function to cancel editing
  const handleCancelEdit = useCallback(() => {
    dispatch(setUserInput(""));
    setEditingMessageIndex(null);
  }, [dispatch]);

  return {
    dispatch,
    chatId, // Add chatId
    isNewChatPath, // Add isNewChatPath
    theme,
    t,
    chats,
    fileUploadLoading,
    userInput,
    sidebarOpen,
    setSidebarOpen,
    dragOver,
    selectedLanguage,
    isMobile,
    currentChat,
    currentChatLoading,
    editingMessageIndex, // Add editing state
    handleFileUpload,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleEditMessage,
    handleCancelEdit, // Add cancel edit function
    onSendMessage,
    handleNewChat,
    handleChatSelect,
    handleEditChatTitle,
    handleDeleteChat,
    handleRemoveFile,
    handleLanguageChange,
    stopGeneration,
  };
}