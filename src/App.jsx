import React, { useState, useEffect, useRef, useCallback } from "react";  
import { Box, createTheme, ThemeProvider } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import InputArea from "./components/InputArea";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

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
    if (!uploadedFile) return;

    let extractedText = ""; // Declare variable to hold extracted text

    setFile(null);
    setFullText("");


    if (uploadedFile.type === "application/pdf") {
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
    }else if (uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // KEY CHANGE: Handle .docx files using mammoth.js
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const { value: docxText } = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        extractedText = docxText;
        console.log("Extracted DOCX text:", extractedText.substring(0, Math.min(extractedText.length, 100)) + "...");
      } catch (error) {
        console.error("DOCX extraction error:", error);
        extractedText = `(Error extracting text from DOCX: ${uploadedFile.name}. File might be corrupted or an unsupported format.)`;
        alert("Failed to extract text from DOCX. Please try another file.");
      }
    } else if (uploadedFile.type.startsWith("image/")) {
      // KEY CHANGE: Handle image files using Tesseract.js for OCR
      try {
        setLoading(true); // Show loading while OCR is in progress
        const { data: { text } } = await Tesseract.recognize(
          uploadedFile, // Tesseract.js can directly take a File object
          'eng', // Specify the language for OCR (e.g., 'eng' for English)
          { logger: m => console.log(m) } // Optional: logs OCR progress to console
        );
        extractedText = text;
        console.log("Extracted OCR text from image:", extractedText.substring(0, Math.min(extractedText.length, 100)) + "...");
      } catch (error) {
        console.error("OCR error:", error);
        extractedText = `(Error performing OCR on image: ${uploadedFile.name}. Image might be unreadable or OCR failed.)`;
        alert("Failed to perform OCR on image. Please try another image or ensure text is clear.");
      } finally {
        setLoading(false); // Hide loading after OCR is done (or failed)
      }
    } else if (uploadedFile.type === "text/plain") {
      // Plain text file handling (Your existing logic)
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          extractedText = event.target.result;
          setFullText(extractedText);
          setFile(uploadedFile);
          setChats(
            chats.map((chat) =>
              chat.id === activeChat
                ? { ...chat, file: uploadedFile, fullText: extractedText }
                : chat
            )
          );
          console.log("Extracted plain text:", extractedText.substring(0, Math.min(extractedText.length, 100)) + "...");
        };
        reader.readAsText(uploadedFile);
        return; // Exit early as setFullText and setFile are handled in reader.onload
      } catch (error) {
        console.error("Error reading text file:", error);
        extractedText = "";
        alert("Failed to read text file.");
      }
    } else {
      // KEY CHANGE: Fallback for other unsupported types
      extractedText = `(File: ${uploadedFile.name} attached. Type: ${uploadedFile.type}. Text extraction not supported on frontend.)`;
      console.log("Unsupported file type attached:", uploadedFile.name);
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

    let contentToSend = userInput;
    // KEY CHANGE: Include fullText from currentChat, which holds extracted text or a placeholder
    const currentChatData = chats.find(c => c.id === activeChat);
    if (currentChatData && currentChatData.fullText) {
        contentToSend += `\n\n[File Context: ${currentChatData.file ? currentChatData.file.name : 'Unknown File'}]\n${currentChatData.fullText}`;
    }

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