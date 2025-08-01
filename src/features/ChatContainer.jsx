// Enhanced ChatContainer.jsx with edit message and stop generation features
import React, { useState, useCallback, useEffect, useRef } from "react";
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

function ChatContainer() {
  const [chats, setChats] = useState([]);
  const [loadingStates, setLoadingStates] = useState({}); // Separate loading states per chat
  const [fileUploadLoading, setFileUploadLoading] = useState(false); // Separate loading for file uploads
  const [userInput, setUserInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Reference to abort controller for stopping API requests
  const abortControllerRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { chatId } = useParams();

  const isNewChatPath = chatId === "new";
  const currentChat = chatId ? chats.find((chat) => chat.id === chatId) : null;

  // Get loading state for current chat
  const currentChatLoading = chatId ? loadingStates[chatId] || false : false;

  // Load chats from localStorage on initial render
  useEffect(() => {
    try {
      const storedChats = localStorage.getItem("pdfChatApp_chats");
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      }
    } catch (error) {
      console.error("Failed to load chats from localStorage:", error);
      localStorage.removeItem("pdfChatApp_chats");
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pdfChatApp_chats", JSON.stringify(chats));
  }, [chats]);

  // Helper functions to manage loading states per chat
  const setLoadingForChat = useCallback((chatId, loading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [chatId]: loading,
    }));
  }, []);

  // Function to stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (chatId) {
      setLoadingForChat(chatId, false);
    }
  }, [chatId, setLoadingForChat]);

  // Function to call DeepSeek R1 through OpenRouter
  const sendMessageToDeepSeek = async (
    message,
    documentText,
    chatHistory = [],
    abortSignal
  ) => {
    try {
      const messages = [
        {
          role: "user",
          content: `You are a helpful AI assistant that answers questions based on the provided document. Here is the document content:

                  ${documentText}

Previous conversation:
${chatHistory
  .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
  .join("\n")}

Current question: ${message}

Please answer the question based on the document content. If the answer is not in the document, say so clearly. Provide detailed and helpful responses.`,
        },
      ];

      console.log("Sending request to OpenRouter...");

      console.log(" OpenRouter API Key in Vercel:", OPENROUTER_CONFIG.apiKey);
      console.log(
        " Full API URL:",
        `${OPENROUTER_CONFIG.baseUrl}/chat/completions`
      );
      console.log(" Using Model:", OPENROUTER_CONFIG.model);

      const response = await fetch(
        `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
            "HTTP-Referer": OPENROUTER_CONFIG.siteUrl,
            "X-Title": OPENROUTER_CONFIG.siteName,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: OPENROUTER_CONFIG.model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
          signal: abortSignal, // Add abort signal
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `OpenRouter API Error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from DeepSeek R1 model");
      }

      return {
        text: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request was aborted");
        throw new Error("Request was stopped by user");
      }
      console.error("DeepSeek API call failed:", error);
      throw error;
    }
  };

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;

      const MAX_FILE_SIZE_MB = 15;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }

      setFileUploadLoading(true); // Use separate file upload loading
      setUserInput("");

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
        };

        setChats((prevChats) => [...prevChats, newChat]);
        navigate(`/chat/${newChatId}`);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process file: " + error.message);
      } finally {
        setFileUploadLoading(false);
      }
    },
    [navigate, setChats, setUserInput]
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
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        const allowedTypes = [".pdf", ".doc", ".docx", ".txt"]; // Removed image/*

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
    [handleFileUpload]
  );

  // Function to handle editing a message
  const handleEditMessage = useCallback(
    (messageIndex, messageText) => {
      if (!currentChat || !chatId) return;

      // Set the message text in the input
      setUserInput(messageText);

      // Remove all messages from the selected index onwards
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.slice(0, messageIndex),
              }
            : chat
        )
      );

      // Focus on the input area (you might need to pass a ref to InputArea for this)
      // This will be handled by the InputArea component
    },
    [currentChat, chatId, setUserInput, setChats]
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
    abortControllerRef.current = new AbortController();

    setLoadingForChat(chatId, true); // Set loading for specific chat
    const messageToSend = userInput;
    setUserInput("");

    // Add user message to chat
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { sender: "user", text: messageToSend },
              ],
            }
          : chat
      )
    );

    try {
      // Call DeepSeek R1 through OpenRouter
      const response = await sendMessageToDeepSeek(
        messageToSend,
        currentChat.fullText,
        currentChat.messages,
        abortControllerRef.current.signal
      );

      // Add AI response to chat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { sender: "ai", text: response.text },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);

      // Don't show error message if request was aborted by user
      if (error.message === "Request was stopped by user") {
        return;
      }

      // Show appropriate error message based on error type
      let errorMessage =
        "I apologize, but I encountered an error while processing your request.";

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to connect to the AI service. Please check your internet connection and try again.";
      } else if (error.message.includes("401")) {
        errorMessage =
          "Invalid API key. Please check your OpenRouter API key in the .env file.";
      } else if (error.message.includes("429")) {
        errorMessage =
          "Rate limit exceeded. Please wait a moment before sending another message.";
      } else if (error.message.includes("402")) {
        errorMessage = "Insufficient credits in your OpenRouter account.";
      } else if (error.message.includes("400")) {
        errorMessage = "Bad request. Please try rephrasing your question.";
      } else if (error.message.includes("OpenRouter API Error")) {
        errorMessage = `API Error: ${error.message}`;
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { sender: "ai", text: errorMessage },
                ],
              }
            : chat
        )
      );
    } finally {
      setLoadingForChat(chatId, false); // Clear loading for specific chat
      abortControllerRef.current = null; // Clear abort controller
    }
  }, [
    userInput,
    currentChatLoading,
    chatId,
    currentChat,
    setChats,
    setUserInput,
    setLoadingForChat,
  ]);

  const handleNewChat = useCallback(() => {
    navigate("/chat/new");
    setUserInput("");
    if (isMobile) setSidebarOpen(false);
  }, [navigate, isMobile]);

  const handleChatSelect = useCallback(
    (id) => {
      navigate(`/chat/${id}`);
      setUserInput("");
      if (isMobile) setSidebarOpen(false);
    },
    [navigate, isMobile]
  );

  const handleEditChatTitle = useCallback((id, newTitle) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    );
  }, []);

  const handleDeleteChat = useCallback(
    (idToDelete) => {
      setChats((prevChats) => {
        const updatedChats = prevChats.filter((chat) => chat.id !== idToDelete);
        if (chatId === idToDelete) {
          navigate("/chat/new");
        }
        return updatedChats;
      });

      // Clean up loading state for deleted chat
      setLoadingStates((prev) => {
        const { [idToDelete]: _, ...rest } = prev;
        return rest;
      });
    },
    [navigate, chatId]
  );

  const handleRemoveFile = useCallback(() => {
    if (currentChat) {
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            file: null,
            fullText: "",
            messages: [],
          };
        }
        return chat;
      });
      setChats(updatedChats);

      // Clear loading state for this chat
      setLoadingForChat(chatId, false);
      navigate("/chat/new");
    }
  }, [chats, navigate, currentChat, chatId, setLoadingForChat]);

  const sidebarWidth = 280;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        bgcolor: "#ffffff",
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChat={chatId}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        isMobile={isMobile}
        onEdit={handleEditChatTitle}
        onDelete={handleDeleteChat}
        sidebarWidth={sidebarWidth}
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
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {isNewChatPath ? (
          <NewChatView
            chats={chats}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            onEditChatTitle={handleEditChatTitle}
            onDeleteChat={handleDeleteChat}
            loading={fileUploadLoading} // Use file upload loading
            dragOver={dragOver}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileInputChange={handleFileInputChange}
          />
        ) : (
          <ChatView
            chats={chats}
            setChats={setChats}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            onEditChatTitle={handleEditChatTitle}
            onDeleteChat={handleDeleteChat}
            onRemoveFile={handleRemoveFile}
            userInput={userInput}
            setUserInput={setUserInput}
            loading={currentChatLoading} // Use current chat's loading state
            setLoading={(loading) => setLoadingForChat(chatId, loading)} // Set loading for current chat
            onSendMessage={onSendMessage}
            onStopGeneration={stopGeneration} // Pass stop function
            onEditMessage={handleEditMessage} // Pass edit message function
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
            bgcolor: dragOver ? "#F3F4F6" : "#F9FAFB",
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              borderColor: ACCENT_COLOR_UPLOAD,
              bgcolor: "#F3F4F6",
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
  setChats,
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
  setLoading,
  onSendMessage,
  onStopGeneration, // New prop
  onEditMessage, // New prop
}) {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const currentChat = chatId ? chats.find((chat) => chat.id === chatId) : null;

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
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        onRemoveFile={onRemoveFile}
      />
      <MessageList
        messages={currentChat.messages}
        loading={loading}
        onEditMessage={onEditMessage} // Pass edit function to MessageList
      />
      <InputArea
        userInput={userInput}
        onInputChange={setUserInput}
        onSend={onSendMessage}
        loading={loading}
        fullText={currentChat.fullText}
        onStopGeneration={onStopGeneration} // Pass stop function to InputArea
      />
    </>
  );
}

export default ChatContainer;
