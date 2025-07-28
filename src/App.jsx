import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback for handleRemoveFile
import { Box, createTheme, ThemeProvider } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import InputArea from "./components/InputArea";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { useMediaQuery, useTheme as useMuiTheme } from "@mui/material";

// Attempt to import local worker, fall back to CDN
let pdfjsWorker;
try {
  pdfjsWorker = require("pdfjs-dist/build/pdf.worker.min.js");
  GlobalWorkerOptions.workerSrc = pdfjsWorker;
  console.log("Using local pdfjs worker:", pdfjsWorker);
} catch (e) {
  GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  console.log("Falling back to CDN pdfjs worker due to error:", e.message);
}

// Custom theme for professional look
const customTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Professional blue
    },
    secondary: {
      main: "#424242", // Dark gray for contrast
    },
    background: {
      default: "#f5f5f5", // Light gray background
      paper: "#ffffff", // White for cards/panels
    },
    text: {
      primary: "#212121", // Dark text for readability
      secondary: "#757575", // Lighter text for secondary info
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [], file: null, fullText: "" },
  ]);
  const [activeChat, setActiveChat] = useState(1);
  const [file, setFile] = useState(null); // State for the currently displayed file
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullText, setFullText] = useState(""); // State for the currently displayed fullText
  const messagesEndRef = useRef(null);

  // Derive current chat from state
  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0];

  // Effect to update local 'file' and 'fullText' states when activeChat changes
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChat);
    if (chat) {
      setFile(chat.file || null);
      setFullText(chat.fullText || "");
    }
  }, [activeChat, chats]); // Depend on activeChat and chats

  // Effect to set sidebarOpen based on mobile status on initial render and resize
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleNewChat = () => {
    const newChatId = Math.max(...chats.map((c) => c.id), 0) + 1;
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      file: null,
      fullText: "",
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChat(newChat.id);
    // setFile and setFullText are now handled by the useEffect above
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    // setFile and setFullText are now handled by the useEffect above
  };

  const handleFileChange = async (e) => {
    console.log("File change triggered");
    const uploadedFile = e.target.files[0];
    let extractedText = ""; // Declare variable to hold extracted text

    if (uploadedFile) {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      try {
        const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(" ") + " ";
        }
        console.log("Extracted fullText:", extractedText);
      } catch (error) {
        console.error("PDF extraction error:", error.message, error.stack);
        extractedText = "";
        alert("Failed to extract text from the PDF. Please use a text-based PDF or check the file.");
      }
    }

    // Update the states AFTER text extraction is complete
    setFile(uploadedFile || null);
    setFullText(extractedText);

    // Update the specific chat entry
    setChats(
      chats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, file: uploadedFile || null, fullText: extractedText }
          : chat
      )
    );
    console.log("Updated chat entry with file and fullText.");
  };

  // New function to handle file removal
  const handleRemoveFile = useCallback(() => {
    setFile(null); // Clear the displayed file
    setFullText(""); // Clear the displayed full text

    // Update the active chat's file and fullText properties
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChat
          ? { ...chat, file: null, fullText: "" }
          : chat
      )
    );
    console.log("File removed from chat.");
  }, [activeChat]); // Dependency on activeChat

  const handleSend = async () => {
    if (!userInput.trim()) return alert("Enter your message!");

    const newUserMessage = {
      text: userInput,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Use a functional update for chats to ensure we're working with the latest state
    setChats(prevChats => {
      const currentChatState = prevChats.find(chat => chat.id === activeChat);
      const updatedMessages = [...currentChatState.messages, newUserMessage];
      return prevChats.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: updatedMessages,
              title: userInput.slice(0, 30) + (userInput.length > 30 ? "..." : ""),
            }
          : chat
      );
    });

    setUserInput("");
    setLoading(true);

    const contentToSend = file
      ? `${userInput} Use the following resume text for reference: ${fullText}`
      : userInput;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Chat App",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
              {
                role: "system",
                content: "You are an AI assistant. Always respond in English.",
              },
              { role: "user", content: contentToSend },
            ],
          }),
        }
      );

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "No response";
      content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      const newAiMessage = {
        text: content,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Use functional update for final messages
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, newAiMessage] } // Add to existing messages
            : chat
        )
      );
    } catch (err) {
      const errorMessage = {
        text: "Error: " + err.message,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chatId, newTitle) => {
    setChats(
      chats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const handleDelete = (chatId) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);

    if (updatedChats.length === 0) {
      const newChatId = Date.now();
      const newChat = { id: newChatId, title: "New Chat", messages: [], file: null, fullText: "" };
      setChats([newChat]);
      setActiveChat(newChatId);
      setFile(null); // Clear display states for new chat
      setUserInput("");
      setFullText(""); // Clear display states for new chat
    } else {
      setChats(updatedChats);
      if (activeChat === chatId) {
        // If the active chat was deleted, switch to the first remaining chat
        setActiveChat(updatedChats[0].id);
        setFile(updatedChats[0].file || null); // Update display states
        setFullText(updatedChats[0].fullText || ""); // Update display states
      }
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chats={chats}
          activeChat={activeChat}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          isMobile={isMobile}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            ml: sidebarOpen && !isMobile ? "300px" : "0",
            transition: "margin-left 0.3s ease",
            bgcolor: "background.paper",
            boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <ChatHeader
            title={currentChat.title}
            file={file} // Pass the 'file' state from App
            onMenuClick={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
            onRemoveFile={handleRemoveFile} 
          />

          <MessageList
            messages={currentChat.messages}
            loading={loading}
            messagesEndRef={messagesEndRef}
            sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}
          />

          <InputArea
            userInput={userInput}
            onInputChange={setUserInput}
            onSend={handleSend}
            onFileUpload={handleFileChange}
            fullText={fullText} // Pass the 'fullText' state from App
            loading={loading}
            sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;