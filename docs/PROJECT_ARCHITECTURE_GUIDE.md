# 📚 FileMentor - Complete Architecture Guide

## 🏠 Main App Structure

### **`src/App.jsx`** - The Front Door 🚪
**Think of it as**: Your house's front door with a security guard

```jsx
function App() {
  return (
    <AuthProvider>  {/* Security system for the whole house */}
      <Routes>
        {/* Public area - anyone can enter */}
        <Route path="/login" element={<Login />} />
        
        {/* Private area - need ID to enter */}
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <ChatContainer />  {/* Main living room */}
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
```

**Key Functions:**
- `AuthProvider`: Wraps entire app with authentication context
- `ProtectedRoute`: Checks if user is logged in before showing chat
- `Routes`: Defines which pages exist in the app

---

## 🔐 Authentication Files

### **`src/firebase/config.js`** - The ID Card System 🆔
**Think of it as**: Your school's student ID system

```javascript
// Setting up connection to Google's servers
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain.firebaseapp.com",
  // ... other config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  // The ID checker
export const googleProvider = new GoogleAuthProvider();  // Google login button
```

**Key Functions:**
- `initializeApp()`: Connects your app to Firebase servers
- `getAuth()`: Creates the authentication system
- `GoogleAuthProvider()`: Enables "Sign in with Google" button

### **`src/contexts/AuthContext.js`** - The Security Guard 👮
**Think of it as**: A security guard who remembers you and tells everyone you're allowed

```javascript
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);  // Remember who's logged in
      setLoading(false);
    });
    return unsubscribe;
  }, []);
}
```

**Key Functions:**
- `signInWithGoogle()`: Opens Google login popup
- `logout()`: Signs user out
- `onAuthStateChanged()`: Watches for login/logout events
- `currentUser`: Stores info about logged-in user

---

## 🧠 State Management (Redux)

### **`src/store/store.js`** - The Brain 🧠
**Think of it as**: Your brain that remembers everything

```javascript
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import { persistenceMiddleware } from '../reducers/middleware/persistenceMiddleware';

// Create the brain with memory sections
export const store = configureStore({
  reducer: {
    chat: chatReducer,  // Memory section for chats
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),  // Auto-save system
});
```

**Key Functions:**
- `configureStore()`: Creates the main memory center
- `chatReducer`: Handles all chat-related memory
- `persistenceMiddleware`: Automatically saves everything

### **`src/store/slices/chatSlice.js`** - The Memory Manager 🗃️
**Think of it as**: A filing cabinet with folders for each chat

```javascript
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],           // All your chat conversations
    loadingStates: {},   // Which chats are loading
    fileUploadLoading: false,  // Is file being uploaded?
    userInput: '',       // What you're typing
    sidebarOpen: false,  // Is sidebar visible?
  },
  reducers: {
    // Add a new chat folder
    addChat: (state, action) => {
      state.chats.push(action.payload);
    },
    
    // Add message to a chat
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.messages.push(message);
      }
    },
    
    // Delete a chat folder
    deleteChat: (state, action) => {
      state.chats = state.chats.filter(chat => chat.id !== action.payload);
    },
    
    // Update chat title
    updateChatTitle: (state, action) => {
      const { chatId, title } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.title = title;
      }
    }
  }
});

// Async function to talk to AI
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async ({ message, chatId, documentText, chatHistory, apiConfig }) => {
    // Prepare conversation for AI
    const messages = [
      {
        role: "user",
        content: `Here is the document: ${documentText}
        Previous conversation: ${chatHistory}
        Current question: ${message}`
      }
    ];

    // Send to AI API
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
);
```

**Key Functions:**
- `addChat()`: Creates new chat when you upload PDF
- `addMessage()`: Adds your questions and AI responses
- `deleteChat()`: Removes chat from list
- `updateChatTitle()`: Changes chat name
- `sendMessageToAI()`: Sends question to AI and gets response

---

## 💾 Data Storage

### **`src/reducers/middleware/persistenceMiddleware.js`** - The Diary Writer 📔
**Think of it as**: A friend who writes down everything you say in a diary

```javascript
// Get storage location for each user
const getUserStorageKey = (userId) => {
  return userId ? `pdfChatApp_chats_${userId}` : 'pdfChatApp_chats_guest';
};

// Load saved chats when app starts
export const initializeChatsFromStorage = createAsyncThunk(
  'chat/initializeChatsFromStorage',
  async (userId) => {
    const storageKey = getUserStorageKey(userId);
    const storedChats = localStorage.getItem(storageKey);
    
    if (storedChats) {
      const parsedChats = JSON.parse(storedChats);
      // Only return chats that belong to this user
      return userId 
        ? parsedChats.filter(chat => chat.userId === userId || !chat.userId)
        : parsedChats;
    }
    return [];
  }
);

// Save chats to computer storage
export const saveChatsToStorage = (chats, userId) => {
  const storageKey = getUserStorageKey(userId);
  localStorage.setItem(storageKey, JSON.stringify(chats));
};

// Auto-save system - runs after every action
export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);  // Do the action first
  const state = store.getState();  // Get current state
  
  // Actions that should trigger saving
  const persistActions = [
    'chat/addChat',
    'chat/updateChatTitle',
    'chat/deleteChat',
    'chat/addMessage',
    'chat/editMessage'
  ];
  
  // If this action should be saved
  if (persistActions.some(actionType => action.type === actionType)) {
    const userId = action.payload?.userId || action.meta?.arg;
    if (userId) {
      saveChatsToStorage(state.chat.chats, userId);  // Save to computer
    }
  }
  
  return result;
};
```

**Key Functions:**
- `getUserStorageKey()`: Creates unique storage location for each user
- `initializeChatsFromStorage()`: Loads saved chats when app starts
- `saveChatsToStorage()`: Saves chats to computer storage
- `persistenceMiddleware()`: Automatically saves after every change

**Why needed**: Without this, all your chats disappear when you refresh the page!

---

## 🎨 Main Components

### **`src/features/ChatContainer.jsx`** - The Main Room 🏠
**Think of it as**: The main living room where everything happens

```javascript
function ChatContainer() {
  // Get user info from security guard
  const { currentUser } = useAuth();
  
  // Get chat data from brain
  const chats = useChats();
  const currentChat = useChat(chatId);
  const userInput = useUserInput();
  const loading = useChatLoading(chatId);
  
  // Load user's saved chats when they log in
  useEffect(() => {
    if (currentUser) {
      dispatch(initializeChatsFromStorage(currentUser.uid));
    }
  }, [currentUser]);

  // Handle PDF upload
  const handleFileUpload = async (file) => {
    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File too big!');
      return;
    }

    // Extract text from PDF
    const fullText = await extractTextFromFile(file);
    
    // Create new chat
    const newChat = {
      id: uuidv4(),  // Random ID
      title: file.name,
      file: { name: file.name, size: file.size },
      fullText: fullText,
      messages: [],
      userId: currentUser?.uid
    };

    // Add to brain and navigate to it
    dispatch(addChat(newChat));
    navigate(`/chat/${newChat.id}`);
  };

  // Send message to AI
  const onSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: userInput };
    dispatch(addMessage({ chatId, message: userMessage }));

    // Send to AI and get response
    await dispatch(sendMessageToAI({
      message: userInput,
      chatId,
      documentText: currentChat.fullText,
      chatHistory: currentChat.messages
    }));

    // Clear input
    dispatch(setUserInput(''));
  };

  // Create new chat
  const handleNewChat = () => {
    navigate('/chat/new');
    dispatch(setUserInput(''));
  };

  // Switch to different chat
  const handleChatSelect = (chatId) => {
    navigate(`/chat/${chatId}`);
    dispatch(setUserInput(''));
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with chat list */}
      <Sidebar
        chats={chats}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
      />
      
      {/* Main chat area */}
      <Box sx={{ flex: 1 }}>
        {chatId === 'new' ? (
          <NewChatView onFileUpload={handleFileUpload} />
        ) : (
          <>
            <ChatHeader title={currentChat?.title} />
            <MessageList messages={currentChat?.messages} />
            <InputArea
              userInput={userInput}
              onSend={onSendMessage}
              loading={loading}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
```

**Key Functions:**
- `handleFileUpload()`: Processes PDF and creates new chat
- `onSendMessage()`: Sends question to AI and shows response
- `handleNewChat()`: Creates new empty chat
- `handleChatSelect()`: Switches between different chats
- `useEffect()`: Loads saved chats when user logs in

### **`src/components/Sidebar.jsx`** - The Chat History Panel 📚
**Think of it as**: A bookshelf where each book is a different PDF conversation

```javascript
function Sidebar({ chats, onNewChat, onChatSelect, onEdit, onDelete }) {
  const { currentUser, logout } = useAuth();
  const [editingChatId, setEditingChatId] = useState(null);

  // Start editing chat title
  const handleEditClick = (chat) => {
    setEditingChatId(chat.id);
    setEditedTitle(chat.title);
  };

  // Save edited title
  const handleSaveEdit = (chatId) => {
    onEdit(chatId, editedTitle);
    setEditingChatId(null);
  };

  return (
    <Drawer sx={{ width: 280 }}>
      {/* New Chat Button */}
      <Button onClick={onNewChat} fullWidth>
        + New Chat
      </Button>

      {/* Chat List */}
      <List>
        {chats.map((chat) => (
          <ListItem key={chat.id}>
            {editingChatId === chat.id ? (
              // Edit mode
              <TextField
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => handleSaveEdit(chat.id)}
              />
            ) : (
              // Normal mode
              <ListItemText
                primary={chat.title}
                onClick={() => onChatSelect(chat.id)}
              />
            )}
            
            {/* Edit and Delete buttons */}
            <IconButton onClick={() => handleEditClick(chat)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => onDelete(chat.id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* User info and logout */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography>{currentUser?.displayName}</Typography>
        <Button onClick={logout}>Logout</Button>
      </Box>
    </Drawer>
  );
}
```

**Key Functions:**
- `handleEditClick()`: Starts editing chat title
- `handleSaveEdit()`: Saves new chat title
- `onChatSelect()`: Opens selected chat
- `onNewChat()`: Creates new chat
- `logout()`: Signs user out

---

## 🔧 Helper Files

### **`src/reducers/hooks.js`** - The Easy Buttons 🎮
**Think of it as**: Remote control buttons for your TV

```javascript
// Easy way to get all chats
export const useChats = () => useAppSelector(state => state.chat.chats);

// Easy way to get specific chat
export const useChat = (chatId) => 
  useAppSelector(state => state.chat.chats.find(chat => chat.id === chatId));

// Easy way to get what user is typing
export const useUserInput = () => useAppSelector(state => state.chat.userInput);

// Easy way to check if chat is loading
export const useChatLoading = (chatId) => 
  useAppSelector(state => state.chat.loadingStates[chatId] || false);

// Easy way to check if sidebar is open
export const useSidebarOpen = () => useAppSelector(state => state.chat.sidebarOpen);

// Easy way to dispatch actions
export const useAppDispatch = () => useDispatch();
```

**Key Functions:**
- `useChats()`: Get list of all chats
- `useChat()`: Get specific chat by ID
- `useUserInput()`: Get current text user is typing
- `useChatLoading()`: Check if AI is thinking
- `useAppDispatch()`: Send commands to the brain

### **`src/utils/fileProcessing.js`** - The Document Reader 📄
**Think of it as**: A smart reader who can read any type of document

```javascript
export const extractTextFromFile = async (file) => {
  let extractedText = '';

  if (file.type === 'application/pdf') {
    // Read PDF files
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument(arrayBuffer).promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + '\n';
    }
  } 
  else if (file.type.includes('word')) {
    // Read Word documents
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value;
  }
  else if (file.type === 'text/plain') {
    // Read text files
    extractedText = await file.text();
  }
  else if (file.type.startsWith('image/')) {
    // Read text from images using OCR
    const result = await Tesseract.recognize(file, 'eng');
    extractedText = result.data.text;
  }

  return extractedText;
};

export const validateFile = (file) => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too big (max 15MB)' };
  }
  
  if (!supportedTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
};
```

**Key Functions:**
- `extractTextFromFile()`: Reads text from PDF, Word, text, or image files
- `validateFile()`: Checks if file is allowed (size and type)

### **`src/theme.js`** - The Interior Designer 🎨
**Think of it as**: An interior designer who picks all the colors

```javascript
const COLORS = {
  primary: "#f4c28e",     // Main peachy-orange
  secondary: "#f4c7a8",   // Light peach
  accent: "#000000",      // Black for text
  white: "#ffffff",       // Pure white
  greys: {
    light: "#f5f5f5",
    medium: "#e0e0e0",
    dark: "#9e9e9e",
  }
};

export const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.secondary },
    background: { default: COLORS.white },
    text: { primary: COLORS.accent },
    custom: {
      sidebar: {
        background: "#1f1e1d",     // Dark sidebar
        text: COLORS.white,        // White text
      },
      chat: {
        userBubble: COLORS.greys.light,  // User message color
        aiBubble: COLORS.white,          // AI message color
      }
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: COLORS.primary,
          '&:hover': { backgroundColor: "#e0ad78" }
        }
      }
    }
  }
});
```

**Key Functions:**
- `COLORS`: Defines all colors used in app
- `theme`: Applies colors to Material-UI components
- `custom`: Special colors for specific parts

---

## 🔄 How Everything Works Together

### **The Complete Flow:**

1. **App Starts** 🚀
   - `App.jsx` loads and checks authentication
   - `AuthContext` determines if user is logged in
   - If logged in, redirects to `/chat/new`

2. **User Logs In** 🔐
   - `Login` component shows Google sign-in button
   - `AuthContext` handles login and stores user info
   - `persistenceMiddleware` loads user's saved chats

3. **User Uploads PDF** 📄
   - `ChatContainer` receives file
   - `fileProcessing.js` extracts text from PDF
   - New chat created and saved to Redux
   - `persistenceMiddleware` automatically saves to localStorage

4. **User Asks Question** ❓
   - User types in `InputArea`
   - `ChatContainer` sends message to `chatSlice`
   - `sendMessageToAI` function calls AI API
   - Response added to chat messages
   - Everything auto-saved to localStorage

5. **User Closes/Reopens App** 🔄
   - `persistenceMiddleware` loads saved chats
   - User sees all previous conversations
   - Can continue where they left off

### **Simple Analogy** 🏠

Think of the app like a **smart library**:

- **Firebase Auth** = Library card system (who can enter)
- **Redux Store** = Librarian's memory (remembers everything)
- **localStorage** = Filing cabinets (permanent storage)
- **ChatContainer** = Main reading room (where you work)
- **Sidebar** = Bookshelf (shows all your books/chats)
- **AI API** = Smart assistant (answers questions about your documents)

The librarian (Redux) remembers everything while you're there, and writes it all down in filing cabinets (localStorage) so it's there when you come back tomorrow!

---

## 🚀 Quick Start Guide

1. **Login** → Google authentication
2. **Upload PDF** → Drag & drop or click upload
3. **Ask Questions** → Type anything about your document
4. **Get Answers** → AI responds based on document content
5. **Switch Chats** → Click different PDFs in sidebar
6. **Edit/Delete** → Right-click chat titles

That's it! The app handles all the complex stuff automatically. 🎉