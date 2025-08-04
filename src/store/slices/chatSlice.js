// store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for sending messages to AI
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async ({ message, chatId, documentText, chatHistory, apiConfig }, { rejectWithValue, signal }) => {
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

      const response = await fetch(
        `${apiConfig.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiConfig.apiKey}`,
            "HTTP-Referer": apiConfig.siteUrl,
            "X-Title": apiConfig.siteName,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: apiConfig.model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
          signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from AI model");
      }

      return {
        text: data.choices[0].message.content,
        usage: data.usage,
        chatId,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request was stopped by user");
      }
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  chats: [],
  loadingStates: {}, // Object to track loading state per chat
  fileUploadLoading: false,
  userInput: '',
  sidebarOpen: true,
  dragOver: false,
  abortControllers: {}, // Store abort controllers per chat
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Chat management
    addChat: (state, action) => {
      state.chats.push(action.payload);
    },
    
    updateChatTitle: (state, action) => {
      const { chatId, title } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.title = title;
      }
    },
    
    deleteChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter(chat => chat.id !== chatId);
      // Clean up loading state and abort controller
      delete state.loadingStates[chatId];
      delete state.abortControllers[chatId];
    },
    
    // Message management
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.messages.push(message);
      }
    },
    
    updateMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.messages = messages;
      }
    },
    
    editMessage: (state, action) => {
      const { chatId, messageIndex } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat && chat.messages) {
        // Remove all messages from the selected index onwards
        chat.messages = chat.messages.slice(0, messageIndex);
      }
    },
    
    // Loading states
    setLoadingForChat: (state, action) => {
      const { chatId, loading } = action.payload;
      state.loadingStates[chatId] = loading;
    },
    
    setFileUploadLoading: (state, action) => {
      state.fileUploadLoading = action.payload;
    },
    
    // UI states
    setUserInput: (state, action) => {
      state.userInput = action.payload;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    setDragOver: (state, action) => {
      state.dragOver = action.payload;
    },
    
    // File management
    updateChatFile: (state, action) => {
      const { chatId, file, fullText } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.file = file;
        chat.fullText = fullText;
        chat.messages = []; // Clear messages when file changes
      }
    },
    
    removeChatFile: (state, action) => {
      const chatId = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        chat.file = null;
        chat.fullText = '';
        chat.messages = [];
      }
    },
    
    // Abort controller management
    setAbortController: (state, action) => {
      const { chatId, abortController } = action.payload;
      state.abortControllers[chatId] = abortController;
    },
    
    clearAbortController: (state, action) => {
      const chatId = action.payload;
      delete state.abortControllers[chatId];
    },
    
    // Load chats from localStorage
    loadChatsFromStorage: (state, action) => {
      state.chats = action.payload;
    },
    
    // Clear all data (for logout/reset)
    clearAllData: (state) => {
      state.chats = [];
      state.loadingStates = {};
      state.fileUploadLoading = false;
      state.userInput = '';
      state.abortControllers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle sendMessageToAI async thunk
      .addCase(sendMessageToAI.pending, (state, action) => {
        const { chatId } = action.meta.arg;
        state.loadingStates[chatId] = true;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        const { chatId, text } = action.payload;
        const chat = state.chats.find(chat => chat.id === chatId);
        if (chat) {
          chat.messages.push({ sender: 'ai', text });
        }
        state.loadingStates[chatId] = false;
        delete state.abortControllers[chatId];
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        const { chatId } = action.meta.arg;
        const chat = state.chats.find(chat => chat.id === chatId);
        
        // Don't add error message if request was aborted by user
        if (action.error.message !== "Request was stopped by user" && chat) {
          let errorMessage = "I apologize, but I encountered an error while processing your request.";
          
          if (action.payload) {
            if (action.payload.includes("Failed to fetch") || action.payload.includes("NetworkError")) {
              errorMessage = "Unable to connect to the AI service. Please check your internet connection and try again.";
            } else if (action.payload.includes("401")) {
              errorMessage = "Invalid API key. Please check your OpenRouter API key.";
            } else if (action.payload.includes("429")) {
              errorMessage = "Rate limit exceeded. Please wait a moment before sending another message.";
            } else if (action.payload.includes("402")) {
              errorMessage = "Insufficient credits in your OpenRouter account.";
            } else if (action.payload.includes("400")) {
              errorMessage = "Bad request. Please try rephrasing your question.";
            } else if (action.payload.includes("OpenRouter API Error")) {
              errorMessage = `API Error: ${action.payload}`;
            }
          }
          
          chat.messages.push({ sender: 'ai', text: errorMessage });
        }
        
        state.loadingStates[chatId] = false;
        delete state.abortControllers[chatId];
      });
  },
});

export const {
  addChat,
  updateChatTitle,
  deleteChat,
  addMessage,
  updateMessages,
  editMessage,
  setLoadingForChat,
  setFileUploadLoading,
  setUserInput,
  setSidebarOpen,
  setDragOver,
  updateChatFile,
  removeChatFile,
  setAbortController,
  clearAbortController,
  loadChatsFromStorage,
  clearAllData,
} = chatSlice.actions;

export default chatSlice.reducer;