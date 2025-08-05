// Enhanced ChatContainer.jsx with Firebase Authentication and Redux integration
import React, { useCallback, useEffect, useRef } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { CloudUpload, Menu as MenuIcon, Image as ImageIcon } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

import MessageList from "../components/MessageList";
import ChatHeader from "../components/ChatHeader";
import InputArea from "../components/InputArea";
import LoadingMessage from "../components/LoadingMessage";
import Sidebar from "../components/Sidebar";

import { extractTextFromFile, processFileInBackground } from "../utils/fileProcessing";
import { useAuth } from "../contexts/AuthContext";

// Redux imports
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
} from "../reducers/hooks";
import {
  addChat,
  updateChatTitle,
  deleteChat,
  addMessage,
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
} from "../store/slices/chatSlice";
import { initializeChatsFromStorage } from "../reducers/middleware/persistenceMiddleware";

const ACCENT_COLOR = "#64B5F6";
const ACCENT_COLOR_HOVER = "#42A5F5";

// OpenRouter API configuration for DeepSeek R1 Free
const OPENROUTER_CONFIG = {
  apiKey: import.meta.env.VITE_API_KEY,
  baseUrl: "https://openrouter.ai/api/v1",
  model: "deepseek/deepseek-r1-0528:free",
  siteUrl: window.location.origin,
  siteName: "PDF Chat App",
};

function ChatContainer( {mode, setMode} ) {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  
  // Redux state
  const chats = useChats();
  const fileUploadLoading = useFileUploadLoading();
  const userInput = useUserInput();
  const sidebarOpen = useSidebarOpen();
  const dragOver = useDragOver();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();
  const { chatId } = useParams();

  const isNewChatPath = chatId === "new";
  const currentChat = useChat(chatId);
  const currentChatLoading = useChatLoading(chatId);
  const currentAbortController = useChatAbortController(chatId);

  // Load chats from localStorage on initial render (user-specific)
  useEffect(() => {
    if (currentUser) {
      dispatch(initializeChatsFromStorage(currentUser.uid));
    }
  }, [dispatch, currentUser]);

  // Function to stop generation
  const stopGeneration = useCallback(() => {
    if (currentAbortController) {
      // The currentAbortController is now a thunk promise with an abort method
      currentAbortController.abort();
      dispatch(clearAbortController(chatId));
    }
  }, [currentAbortController, chatId, dispatch]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;

      const MAX_FILE_SIZE_MB = 15;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
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

        const newChat = {
          id: newChatId,
          title: defaultTitle,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            isImage: file.type.startsWith('image/'), // Track if it's an image
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
        alert("Failed to process file: " + error.message);
      } finally {
        dispatch(setFileUploadLoading(false));
      }
    },
    [dispatch, navigate, currentUser]
  );

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
        alert("Please upload a PDF, DOC, DOCX, TXT, or Image file (JPG, PNG, GIF, BMP, WebP).");
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
          alert("Please upload a PDF, DOC, DOCX, TXT, or Image file.");
        }
      }
    },
    [handleFileUpload, dispatch]
  );

  // Function to handle editing a message
  const handleEditMessage = useCallback(
    (messageIndex, messageText) => {
      if (!currentChat || !chatId) return;

      // Set the message text in the input
      dispatch(setUserInput(messageText));

      // Remove all messages from the selected index onwards
      dispatch(editMessage({ chatId, messageIndex }));
    },
    [currentChat, chatId, dispatch]
  );

  const onSendMessage = useCallback(async () => {
    if (!userInput.trim() || currentChatLoading || !currentChat || !chatId)
      return;

    // Check if API key is configured
    if (!OPENROUTER_CONFIG.apiKey) {
      alert(
        "Please configure your OpenRouter API key in the .env file as VITE_API_KEY"
      );
      return;
    }

    const messageToSend = userInput;
    dispatch(setUserInput(""));

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
        isImageChat: currentChat.file?.isImage || false, // Pass image chat flag
      });

      const thunkPromise = dispatch(thunkAction);

      // Store the thunk promise so we can abort it
      dispatch(setAbortController({ chatId, abortController: thunkPromise }));

      await thunkPromise;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [
    userInput,
    currentChatLoading,
    chatId,
    currentChat,
    dispatch,
  ]);

  const handleNewChat = useCallback(() => {
    navigate("/chat/new");
    dispatch(setUserInput(""));
    if (isMobile) dispatch(setSidebarOpen(false));
  }, [navigate, isMobile, dispatch]);

  const handleChatSelect = useCallback(
    (id) => {
      navigate(`/chat/${id}`);
      dispatch(setUserInput(""));
      if (isMobile) dispatch(setSidebarOpen(false));
    },
    [navigate, isMobile, dispatch]
  );

  const handleEditChatTitle = useCallback((id, newTitle) => {
    dispatch(updateChatTitle({ chatId: id, title: newTitle }));
  }, [dispatch]);

  const handleDeleteChat = useCallback(
    (idToDelete) => {
      dispatch(deleteChat(idToDelete));
      if (chatId === idToDelete) {
        navigate("/chat/new");
      }
    },
    [navigate, chatId, dispatch]
  );

  const handleRemoveFile = useCallback(() => {
    if (currentChat) {
      dispatch(removeChatFile(chatId));
      navigate("/chat/new");
    }
  }, [currentChat, chatId, dispatch, navigate]);

  const sidebarWidth = 280;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        chats={chats}
        activeChat={chatId}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        isMobile={isMobile}
        onEdit={handleEditChatTitle}
        onDelete={handleDeleteChat}
        sidebarWidth={sidebarWidth}
        mode={mode}
        setMode={setMode}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: isMobile
            ? "100%"
            : sidebarOpen
            ? `calc(100% - ${sidebarWidth}px)`
            : "100%",
          marginLeft: isMobile ? 0 : sidebarOpen ? `${sidebarWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          backgroundColor: theme.palette.background.default,
          overflow: "hidden",
        }}
      >
        {isNewChatPath ? (
          <NewChatView
            chats={chats}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={(open) => dispatch(setSidebarOpen(open))}
            isMobile={isMobile}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            onEditChatTitle={handleEditChatTitle}
            onDeleteChat={handleDeleteChat}
            loading={fileUploadLoading}
            dragOver={dragOver}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileInputChange={handleFileInputChange}
          />
        ) : (
          <ChatView
            chats={chats}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={(open) => dispatch(setSidebarOpen(open))}
            isMobile={isMobile}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            onEditChatTitle={handleEditChatTitle}
            onDeleteChat={handleDeleteChat}
            onRemoveFile={handleRemoveFile}
            userInput={userInput}
            setUserInput={(input) => dispatch(setUserInput(input))}
            loading={currentChatLoading}
            onSendMessage={onSendMessage}
            onStopGeneration={stopGeneration}
            onEditMessage={handleEditMessage}
          />
        )}
      </Box>
    </Box>
  );
}

// NewChatView Component
// Updated NewChatView Component with proper dark mode support
function NewChatView({
  chats,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onNewChat,
  onChatSelect,
  onEditChatTitle,
  onDeleteChat,
  loading,
  dragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInputChange,
}) {
  const ACCENT_COLOR_UPLOAD = "#4F46E5";
  const ACCENT_COLOR_UPLOAD_HOVER = "#4338CA";
  const theme = useTheme();

  // Theme-aware colors
  const getThemeColors = () => ({
    // Upload area background - grey in dark mode, light grey in light mode
    uploadBg: theme.palette.mode === 'dark' ? '#2D2D2D' : '#F9FAFB',
    uploadBgHover: theme.palette.mode === 'dark' ? '#3A3A3A' : '#F3F4F6',
    uploadBgDrag: theme.palette.mode === 'dark' ? '#404040' : '#F3F4F6',
    
    // Border colors
    borderDefault: theme.palette.mode === 'dark' ? '#4A4A4A' : '#E5E7EB',
    borderDrag: ACCENT_COLOR_UPLOAD,
    
    // Text colors
    titleColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
    descriptionColor: theme.palette.mode === 'dark' ? '#D1D5DB' : '#6B7280',
    
    // Icon background
    iconBg: theme.palette.mode === 'dark' ? '#3730A3' : '#EEF2FF',
    
    // Menu button
    menuBg: theme.palette.mode === 'dark' ? '#2D2D2D' : '#f1f3f4',
    menuBgHover: theme.palette.mode === 'dark' ? '#3A3A3A' : '#e8eaed',
    menuColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#5f6368',
    menuColorHover: theme.palette.mode === 'dark' ? '#FFFFFF' : '#202124',
    menuBorder: theme.palette.mode === 'dark' ? '#4A4A4A' : '#dadce0',
  });

  const colors = getThemeColors();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        bgcolor: "transparent",
        position: "relative",
        px: 3,
        height: "100%",
        boxSizing: "border-box",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {(!sidebarOpen || isMobile) && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => setSidebarOpen(true)}
            sx={{
              minWidth: "auto",
              p: 1.5,
              bgcolor: colors.menuBg,
              color: colors.menuColor,
              "&:hover": {
                bgcolor: colors.menuBgHover,
                color: colors.menuColorHover,
              },
              borderRadius: 2,
              border: `1px solid ${colors.menuBorder}`,
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
      )}

      <Box sx={{ textAlign: "center", maxWidth: "700px", width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            border: dragOver
              ? `2px solid ${colors.borderDrag}`
              : `2px dashed ${colors.borderDefault}`,
            borderRadius: "12px",
            p: 6,
            mb: 4,
            bgcolor: dragOver ? colors.uploadBgDrag : colors.uploadBg,
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              borderColor: ACCENT_COLOR_UPLOAD,
              bgcolor: colors.uploadBgHover,
            },
            maxWidth: "600px",
            mx: "auto",
          }}
          onClick={() => document.getElementById("file-upload-button").click()}
        >
          {/* Updated icon section with both file and image icons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: colors.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <CloudUpload sx={{ fontSize: 40, color: ACCENT_COLOR_UPLOAD }} />
            </Box>
            
            {/* NEW: Image icon */}
            <Box
              sx={{
                width: 80, // Same size as main upload icon
                height: 80,
                borderRadius: "50%",
                bgcolor: colors.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                alignSelf: 'center', // Center aligned with main icon
                opacity: 0.9, // Slightly more visible
              }}
            >
              <ImageIcon sx={{ fontSize: 40, color: ACCENT_COLOR_UPLOAD }} />
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: colors.titleColor,
              fontWeight: 600,
              mb: 1.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              lineHeight: "28px",
            }}
          >
            Start chat with your files
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.descriptionColor,
              mb: 3,
              lineHeight: "24px",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            Click or Drag & Drop to upload PDF, DOC, DOCX, TXT files or Images (JPG, PNG, GIF) up to 15MB
          </Typography>

          <input
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            style={{ display: "none" }}
            id="file-upload-button"
            type="file"
            onChange={handleFileInputChange}
          />

          <Button
            variant="contained"
            sx={{
              bgcolor: ACCENT_COLOR_UPLOAD,
              "&:hover": { bgcolor: ACCENT_COLOR_UPLOAD_HOVER },
              py: 1.2,
              px: 3.5,
              fontSize: "0.875rem",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              color: "#FFFFFF",
            }}
            disabled={loading}
          >
            Upload Document or Image
          </Button>
        </Paper>

        {loading && <LoadingMessage text="Processing your file..." />}
      </Box>
    </Box>
  );
}

// ChatView Component
function ChatView({
  chats,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onNewChat,
  onChatSelect,
  onEditChatTitle,
  onDeleteChat,
  onRemoveFile,
  userInput,
  setUserInput,
  loading,
  onSendMessage,
  onStopGeneration,
  onEditMessage,
}) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentChat = useChat(chatId);

  useEffect(() => {
    if (!currentChat && chatId !== "new") {
      const timer = setTimeout(() => {
        console.warn(
          `Chat with ID ${chatId} not found in current session. Redirecting to new chat.`
        );
        navigate("/chat/new", { replace: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentChat, chatId, navigate]);

  if (!currentChat) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Loading chat or chat not found...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ChatHeader
        title={currentChat.title}
        file={currentChat.file}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        onRemoveFile={onRemoveFile}
        processingComplete={currentChat.processingComplete !== false}
        processingError={currentChat.processingError || false}
      />
      <MessageList
        messages={currentChat.messages}
        loading={loading}
        onEditMessage={onEditMessage}
      />
      <InputArea
        userInput={userInput}
        onInputChange={setUserInput}
        onSend={onSendMessage}
        loading={loading}
        fullText={currentChat.fullText}
        onStopGeneration={onStopGeneration}
        processingComplete={currentChat.processingComplete !== false}
        processingError={currentChat.processingError || false}
      />
    </>
  );
}

export default ChatContainer; 
