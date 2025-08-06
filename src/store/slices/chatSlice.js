import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for sending messages to AI
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async ({ message, chatId, documentText, chatHistory, apiConfig, isImageChat, selectedLanguage }, { rejectWithValue, signal }) => {
    try {
      let systemPrompt = '';
      
      // Language instruction based on selected language
      const languageInstruction = selectedLanguage && selectedLanguage !== 'English' 
        ? `\n\nLANGUAGE INSTRUCTION: Please respond in ${selectedLanguage}. If the user asks a question in ${selectedLanguage}, answer in ${selectedLanguage}. If they ask in English, you can respond in ${selectedLanguage} or English based on the context.`
        : '';

      if (isImageChat) {
        systemPrompt = `You are a helpful AI assistant that analyzes images and gives concise, direct answers. The user has uploaded an image, and here's what I can see in it:

${documentText}

Previous conversation:
${chatHistory
  .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
  .join("\n")}

Current question: ${message}

IMPORTANT: Give brief, direct answers. If asked for specific information (like dates, numbers, names), provide only that information without extra explanation unless specifically requested. For example:
- If asked "What is the date?" → Just give the date
- If asked "What color is the car?" → Just give the color
- If asked "How many people?" → Just give the number

Answer based on the image content above.${languageInstruction}`;
      } else {
        systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document. Here is the document content:

${documentText}

Previous conversation:
${chatHistory
  .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
  .join("\n")}

Current question: ${message}

IMPORTANT: Give brief, direct answers. If asked for specific information (like dates, numbers, names, amounts), provide only that information without extra explanation unless specifically requested. For example:
- If asked "What is the date?" → Just give the date
- If asked "What is the total amount?" → Just give the amount
- If asked "Who is the author?" → Just give the name

Answer based on the document content. If the answer is not in the document, say "Not found in document."${languageInstruction}`;
      }

      const messages = [
        {
          role: "user",
          content: systemPrompt,
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
  selectedLanguage: 'English', // Default language
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
    
    // FIXED: Edit message functionality
    editMessage: (state, action) => {
      const { chatId, messageIndex } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat && chat.messages) {
        // Remove all messages from the selected index onwards
        chat.messages = chat.messages.slice(0, messageIndex);
      }
    },

    // NEW: Replace AI response functionality
    replaceAIResponse: (state, action) => {
      const { chatId, messageIndex, newResponse } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat && chat.messages && chat.messages[messageIndex]) {
        // Replace the AI response at the specific index
        chat.messages[messageIndex] = {
          ...chat.messages[messageIndex],
          text: newResponse
        };
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
      const { chatId, file, fullText, processingComplete, processingError } = action.payload;
      const chat = state.chats.find(chat => chat.id === chatId);
      if (chat) {
        if (file !== undefined) chat.file = file;
        if (fullText !== undefined) chat.fullText = fullText;
        if (processingComplete !== undefined) chat.processingComplete = processingComplete;
        if (processingError !== undefined) chat.processingError = processingError;
        // Only clear messages when file changes, not during background processing
        if (file !== undefined) chat.messages = [];
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
    
    // Language management
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    
    // Clear all data (for logout/reset)
    clearAllData: (state) => {
      state.chats = [];
      state.loadingStates = {};
      state.fileUploadLoading = false;
      state.userInput = '';
      state.abortControllers = {};
      state.selectedLanguage = 'English';
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
  replaceAIResponse, // Export the new action
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
  setSelectedLanguage,
  clearAllData,
} = chatSlice.actions;

export default chatSlice.reducer;