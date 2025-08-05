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
import { CloudUpload, Menu as MenuIcon } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

import MessageList from "../components/MessageList";
import ChatHeader from "../components/ChatHeader";
import InputArea from "../components/InputArea";
import LoadingMessage from "../components/LoadingMessage";
import Sidebar from "../components/Sidebar";

import { extractTextFromFile } from "../utils/fileProcessing";
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
        const fullText = await extractTextFromFile(file);
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
          },
          fullText: fullText,
          messages: [],
          userId: currentUser?.uid, // Add user ID to chat
        };

        dispatch(addChat(newChat));
        navigate(`/chat/${newChatId}`);
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

      // Check if file is an image
      if (file.type.startsWith("image/")) {
        alert(
          "Image uploads are not supported. Please upload a PDF, DOC, DOCX, or TXT file."
        );
        event.target.value = null;
        return;
      }

      if (file) await handleFileUpload(file);
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
        const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];

        // Check if file is an image
        if (file.type.startsWith("image/")) {
          alert(
            "Image uploads are not supported. Please upload a PDF, DOC, DOCX, or TXT file."
          );
          return;
        }

        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        if (allowedTypes.includes(fileExtension)) {
          await handleFileUpload(file);
        } else {
          alert("Please upload a PDF, DOC, DOCX, or TXT file.");
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

    // Create new abort controller
    const abortController = new AbortController();
    dispatch(setAbortController({ chatId, abortController }));

    const messageToSend = userInput;
    dispatch(setUserInput(""));

    // Add user message to chat
    dispatch(addMessage({ 
      chatId, 
      message: { sender: "user", text: messageToSend } 
    }));

    try {
      // Dispatch the async thunk
      await dispatch(sendMessageToAI({
        message: messageToSend,
        chatId,
        documentText: currentChat.fullText,
        chatHistory: currentChat.messages,
        apiConfig: OPENROUTER_CONFIG,
      }));
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
              bgcolor: "#f1f3f4",
              color: "#5f6368",
              "&:hover": {
                bgcolor: "#e8eaed",
                color: "#202124",
              },
              borderRadius: 2,
              border: "1px solid #dadce0",
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
      )}

      <Box
        sx={{
          textAlign: "center",
          maxWidth: "900px",
          width: "100%",
          mx: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: dragOver
              ? `2px solid ${ACCENT_COLOR_UPLOAD}`
              : "2px dashed #E5E7EB",
            borderRadius: "12px",
            p: 6,
            mb: 4,
            bgcolor: dragOver
              ? (theme.palette.mode === "dark" ? "#232323" : "#F3F4F6")
              : (theme.palette.mode === "dark" ? "#181818" : "#F9FAFB"),
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              borderColor: ACCENT_COLOR_UPLOAD,
              bgcolor: theme.palette.mode === "dark" ? "#232323" : "#F3F4F6",
            },
            maxWidth: "600px",
            mx: "auto",
          }}
          onClick={() => document.getElementById("file-upload-button").click()}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
              transition: "all 0.3s ease",
            }}
          >
            <CloudUpload sx={{ fontSize: 40, color: ACCENT_COLOR_UPLOAD }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: "#111827",
              fontWeight: 600,
              mb: 1.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              lineHeight: "28px",
            }}
          >
            Start chat with your PDF
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#6B7280",
              mb: 3,
              lineHeight: "24px",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            Click or Drag & Drop to upload PDF, DOC, DOCX, or TXT files (up to
            15MB)
          </Typography>

          <input
            accept=".pdf,.doc,.docx,.txt"
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
            }}
            disabled={loading}
          >
            Upload PDF or Document
          </Button>
        </Paper>

        {loading && <LoadingMessage text="" />}
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
      />
    </>
  );
}

export default ChatContainer; 