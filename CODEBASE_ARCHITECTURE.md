# 📁 **FileMentor - Complete Codebase Architecture Documentation**

## 🏗️ **Project Overview**

FileMentor is a React-based AI chat application that allows users to upload documents/images and ask questions about them. The AI provides intelligent responses based on the uploaded content.

### **Tech Stack:**
- **Frontend**: React 18 + Material-UI
- **State Management**: Redux Toolkit
- **Authentication**: Firebase Auth
- **AI API**: OpenRouter (GPT models)
- **File Processing**: OCR for images, text extraction for documents
- **Storage**: Local Storage (Redux Persist)

---

## 📂 **Project Structure**

```
src/
├── App.jsx                    # Main app entry point & routing
├── features/
│   └── ChatContainer.jsx      # Main chat logic & container (BRAIN)
├── components/               # UI Components
│   ├── MessageList.jsx       # Display chat messages
│   ├── InputArea.jsx         # Input field & send/stop buttons
│   ├── ChatHeader.jsx        # Chat title & controls
│   ├── Sidebar.jsx           # Chat list sidebar
│   ├── Login.jsx             # Authentication UI
│   └── ProtectedRoute.jsx    # Route protection wrapper
├── store/                    # Redux state management
│   ├── store.js              # Redux store configuration
│   └── slices/
│       └── chatSlice.js      # Chat state & API calls
├── reducers/
│   ├── hooks.js              # Custom Redux selector hooks
│   └── middleware/
│       └── persistenceMiddleware.js  # Local storage persistence
└── services/
    └── auth.js               # Firebase authentication service
```

---

## 🧠 **Core Architecture Patterns**

### 1. **Container/Presentational Pattern**
- **ChatContainer.jsx**: Logic, state management, API calls
- **Components**: Pure UI components that receive props

### 2. **Redux State Management**
- **Centralized state** in Redux store
- **Custom hooks** for clean state access
- **Async thunks** for API calls with loading states

### 3. **Props Flow Architecture**
```
ChatContainer (Logic)
    ↓ props
Components (UI)
    ↑ callbacks
ChatContainer (Handlers)
```

---

## 📄 **File-by-File Breakdown**

### 🎯 **1. App.jsx - Application Entry Point**

**Purpose**: Main app setup with providers and routing

**Key Features:**
- Redux Provider setup
- Firebase Auth Provider
- Material-UI Theme Provider
- React Router with protected routes
- Redirects root to `/chat/new`

**Route Structure:**
```javascript
/login           → Login component
/chat/:chatId    → ChatContainer (protected)
/               → Redirect to /chat/new
```

---

### 🧠 **2. ChatContainer.jsx - Main Logic Hub (MOST IMPORTANT)**

**Purpose**: The brain of the application - handles all chat logic, state management, and API calls

#### **Redux State Used:**
```javascript
const chats = useChats();                    // All chats array
const fileUploadLoading = useFileUploadLoading(); // File upload status
const userInput = useUserInput();           // Current input text
const sidebarOpen = useSidebarOpen();       // Sidebar visibility
const currentChat = useChat(chatId);        // Current chat data
const currentChatLoading = useChatLoading(chatId); // AI loading state
const currentAbortController = useChatAbortController(chatId); // Stop functionality
```

#### **Key Functions:**

1. **`handleFileUpload(file)`**
   - Processes uploaded documents/images
   - Extracts text content using OCR/text extraction
   - Updates chat with file information

2. **`onSendMessage()`**
   - Sends user message to AI
   - Creates abort controller for stop functionality
   - Manages loading states
   - Handles API errors

3. **`stopGeneration()`**
   - Cancels ongoing AI request
   - Uses Redux Toolkit's built-in abort mechanism

4. **`handleEditMessage(messageIndex, messageText)`**
   - Puts edited message back in input field
   - Removes subsequent messages for regeneration

5. **`handleNewChat()` / `handleChatSelect(chatId)`**
   - Navigation between chats
   - Creates new chat sessions

#### **Component Rendering Logic:**
```javascript
if (isNewChatPath) {
  return <NewChatView />     // File upload interface
} else {
  return <ChatView />        // Chat interface
}
```

---

### 💬 **3. MessageList.jsx - Chat Messages Display**

**Purpose**: Renders chat messages with formatting and edit functionality

**Props Received:**
```javascript
{
  messages: Array,        // Chat messages array
  loading: Boolean,       // AI response loading state
  onEditMessage: Function // Edit message callback
}
```

**Key Features:**
- **ReactMarkdown rendering** for formatted AI responses
- **Auto-scroll** to latest message
- **Edit button** on user messages (hover to show)
- **Empty state** when no messages
- **Loading indicator** during AI generation

**Message Object Structure:**
```javascript
{
  sender: 'user' | 'ai',    // Message sender
  text: 'message content'   // Message text
}
```

---

### ⌨️ **4. InputArea.jsx - Input Field & Controls**

**Purpose**: Text input with send/stop button functionality

**Props Received:**
```javascript
{
  userInput: String,           // Current input text
  onInputChange: Function,     // Update input callback
  onSend: Function,           // Send message callback
  loading: Boolean,           // AI loading state
  fullText: String,           // Document content (enables input)
  onStopGeneration: Function, // Stop AI callback
  processingComplete: Boolean,// File processing status
  processingError: Boolean    // File processing error
}
```

**Key Features:**
- **Multiline text input** with auto-resize
- **Enter to send** (Shift+Enter for new line)
- **Dynamic button**: Send (normal) ↔ Stop (during AI generation)
- **Disabled state** until document uploaded
- **Visual feedback** for processing states

---

### 🎛️ **5. ChatHeader.jsx - Chat Title & Controls**

**Purpose**: Chat title display with edit/delete controls and file indicator

**Props Received:**
```javascript
{
  title: String,           // Chat title
  onEditTitle: Function,   // Edit title callback
  onDeleteChat: Function,  // Delete chat callback
  onToggleSidebar: Function, // Toggle sidebar callback
  sidebarOpen: Boolean,    // Sidebar state
  isMobile: Boolean,       // Mobile detection
  onRemoveFile: Function,  // Remove file callback
  hasFile: Boolean,        // File uploaded indicator
  fileName: String         // Uploaded file name
}
```

**Key Features:**
- **Responsive design** with mobile hamburger menu
- **Editable chat title** with inline editing
- **File indicator chip** with remove option
- **Chat actions** (edit, delete)
- **Sidebar toggle** button

---

### 📋 **6. Sidebar.jsx - Chat List & Navigation**

**Purpose**: Chat list with navigation and management

**Props Received:**
```javascript
{
  chats: Array,            // All chats
  currentChatId: String,   // Active chat ID
  onChatSelect: Function,  // Navigate to chat
  onNewChat: Function,     // Create new chat
  onEditChatTitle: Function, // Edit chat title
  onDeleteChat: Function,  // Delete chat
  sidebarOpen: Boolean,    // Sidebar visibility
  setSidebarOpen: Function, // Toggle sidebar
  isMobile: Boolean        // Mobile detection
}
```

**Key Features:**
- **Responsive drawer** (persistent on desktop, overlay on mobile)
- **New chat button** at top
- **Chat list** with selection highlighting
- **Chat actions** (edit title, delete)
- **Auto-close** on mobile after selection

---

## 🗄️ **Redux State Management**

### **State Structure (chatSlice.js):**
```javascript
{
  chats: [                    // Array of chat objects
    {
      id: 'uuid',             // Unique identifier
      title: 'Chat Title',    // Display title
      messages: [             // Message history
        { sender: 'user', text: '...' },
        { sender: 'ai', text: '...' }
      ],
      file: {                 // Uploaded file info
        name: 'document.pdf',
        type: 'application/pdf',
        isImage: false
      },
      fullText: 'content...',  // Extracted text
      processingComplete: true, // Processing status
      processingError: false,  // Error status
      createdAt: timestamp,    // Creation time
      updatedAt: timestamp     // Last update
    }
  ],
  loadingStates: {            // Per-chat loading states
    'chatId1': false,
    'chatId2': true
  },
  fileUploadLoading: false,   // File upload status
  userInput: '',              // Current input text
  sidebarOpen: true,          // Sidebar visibility
  dragOver: false,            // Drag & drop state
  abortControllers: {         // Per-chat abort controllers
    'chatId1': abortController
  }
}
```

### **Key Actions:**
```javascript
// Synchronous actions
addChat(payload)             // Create new chat
deleteChat(chatId)           // Remove chat
addMessage({chatId, message}) // Add message
editMessage({chatId, messageIndex}) // Remove from index
updateChatTitle({chatId, title}) // Update title
setUserInput(text)           // Update input
setSidebarOpen(boolean)      // Toggle sidebar
setAbortController({chatId, controller}) // Store abort
clearAbortController(chatId) // Remove abort

// Async thunk
sendMessageToAI({            // Send to AI API
  message,
  chatId,
  documentText,
  chatHistory,
  apiConfig,
  isImageChat
})
```

---

### **Custom Redux Hooks (hooks.js):**
```javascript
useChats()                   // Get all chats
useChat(chatId)              // Get specific chat
useChatLoading(chatId)       // Get chat loading state
useChatAbortController(chatId) // Get abort controller
useFileUploadLoading()       // Get file upload state
useUserInput()               // Get current input
useSidebarOpen()             // Get sidebar state
useDragOver()                // Get drag state
```

---

## 🔄 **Complete Data Flow Examples**

### **📤 Sending a Message Flow:**

1. **User Input**: Types in InputArea
   ```
   InputArea → onInputChange → Redux: setUserInput(text)
   ```

2. **Send Message**: Clicks send button
   ```
   InputArea → onSend → ChatContainer: onSendMessage()
   ```

3. **Message Processing**: ChatContainer handles
   ```javascript
   onSendMessage() {
     // Create thunk action
     const thunkAction = sendMessageToAI({...});
     const thunkPromise = dispatch(thunkAction);
     
     // Store abort controller
     dispatch(setAbortController({chatId, abortController: thunkPromise}));
     
     // Add user message
     dispatch(addMessage({chatId, message: {sender: 'user', text}}));
     
     // Clear input
     dispatch(setUserInput(""));
   }
   ```

4. **API Call**: sendMessageToAI thunk
   ```javascript
   // Sets loading state
   loadingStates[chatId] = true
   
   // Makes API call with abort signal
   fetch(apiUrl, { signal })
   
   // On success: adds AI message, clears loading
   // On error: adds error message, clears loading
   ```

5. **UI Updates**: Components re-render
   ```
   MessageList: Shows new messages
   InputArea: Shows stop button (loading=true)
   ```

### **🛑 Stop Button Flow:**

1. **User Action**: Clicks stop button
   ```
   InputArea → onStopGeneration → ChatContainer: stopGeneration()
   ```

2. **Abort Request**: ChatContainer handles
   ```javascript
   stopGeneration() {
     if (currentAbortController) {
       currentAbortController.abort();  // Cancel API request
       dispatch(clearAbortController(chatId));
     }
   }
   ```

3. **API Cancellation**: Request cancelled
   ```
   fetch() receives abort signal → throws AbortError → thunk rejected
   ```

4. **UI Updates**: Loading stops
   ```
   loading = false → InputArea shows send button
   ```

### **✏️ Edit Message Flow:**

1. **User Action**: Clicks edit on message
   ```
   MessageList → handleEditClick → onEditMessage → ChatContainer: handleEditMessage()
   ```

2. **Edit Processing**: ChatContainer handles
   ```javascript
   handleEditMessage(messageIndex, messageText) {
     // Put text back in input
     dispatch(setUserInput(messageText));
     
     // Remove messages from index onwards
     dispatch(editMessage({chatId, messageIndex}));
   }
   ```

3. **UI Updates**: Input populated, messages removed
   ```
   InputArea: Shows original message text
   MessageList: Shows messages up to edited point
   ```

---

## 🔧 **Key Technical Implementation Details**

### **Stop Button Fix (Recent Change):**
- **Problem**: Manual AbortController wasn't connected to Redux thunk
- **Solution**: Store thunk promise (has built-in abort method)
- **Implementation**: `thunkPromise.abort()` cancels the fetch request

### **File Upload Processing:**
- **Images**: OCR text extraction + visual analysis prompts
- **Documents**: Text extraction from PDF/DOC files
- **Storage**: File info + extracted text stored in chat object

### **Responsive Design:**
- **Desktop**: Persistent sidebar, larger input area
- **Mobile**: Overlay sidebar, compact layout, touch-friendly buttons

### **Local Storage Persistence:**
- **Auto-save**: All chats saved to localStorage
- **User-specific**: Separate storage per authenticated user
- **Restoration**: Chats restored on app reload

---

## 🎯 **Architecture Benefits**

1. **Separation of Concerns**: Logic in containers, UI in components
2. **Predictable State**: Centralized Redux state management
3. **Reusable Components**: Clean prop interfaces
4. **Type Safety**: Consistent data structures
5. **Error Handling**: Graceful API error management
6. **Performance**: Efficient re-renders with proper state structure
7. **Maintainability**: Clear file organization and responsibilities

This architecture provides a scalable, maintainable foundation for the FileMentor chat application.
