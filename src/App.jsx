import React, { useState, useRef } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import InputArea from "./components/InputArea";
import { getDocument } from "pdfjs-dist";
import { useMediaQuery, useTheme } from "@mui/material";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [] },
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [file, setFile] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fullText, setFullText] = useState("");
  const messagesEndRef = useRef(null);

  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0];

  // Define all handler functions
  const handleNewChat = () => {
    const newChatId = Math.max(...chats.map((c) => c.id), 0) + 1;
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
    };
   
    setChats((prev) => [...prev, newChat]);
    setActiveChat(newChat.id);
    // setActiveChat(newChatId);
    setFile(null);
    setUserInput("");
    setSuggestions([]);
    setFullText("");
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setFile(chat.file || null);
      setFullText(chat.fullText || "");
    }
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    if (uploadedFile) {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) })
        .promise;
      let text = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => item.str).join(" ") + " ";
      }

      setFullText(text);

      const words = text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);
      const uniqueTerms = [...new Set(words)];
      const templates = [
        (term) => `What is your experience with ${term}?`,
        (term) => `Have you used ${term} in any project?`,
      ];

      const allSuggestions = uniqueTerms
        .slice(0, 5)
        .flatMap((term) => templates.map((t) => t(term)));

      const shuffled = allSuggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setSuggestions(shuffled);

      setChats(
        chats.map((chat) =>
          chat.id === activeChat
            ? { ...chat, file: uploadedFile, fullText: text }
            : chat
        )
      );
    }
  };

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

    const updatedMessages = [...currentChat.messages, newUserMessage];
    const updatedChats = chats.map((chat) =>
      chat.id === activeChat
        ? {
            ...chat,
            messages: updatedMessages,
            title:
              userInput.slice(0, 30) + (userInput.length > 30 ? "..." : ""),
          }
        : chat
    );

    setChats(updatedChats);
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

      const finalMessages = [...updatedMessages, newAiMessage];
      const finalChats = updatedChats.map((chat) =>
        chat.id === activeChat ? { ...chat, messages: finalMessages } : chat
      );

      setChats(finalChats);
    } catch (err) {
      const errorMessage = {
        text: "Error: " + err.message,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const errorUpdatedChats = chats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      );

      setChats(errorUpdatedChats);
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
    // if (window.confirm("Are you sure you want to delete this chat?"))
    const updatedChats = chats.filter((chat) => chat.id !== chatId);

    if (updatedChats.length === 0) {
      // If no chats remain, create a new default chat
      const newChatId = Date.now();
      const newChat = { id: newChatId, title: "New Chat", messages: [] };
      setChats([newChat]);
      setActiveChat(newChatId);
      setFile(null);
      setUserInput("");
      setSuggestions([]);
      setFullText("");
    } else {
      // Set another chat as active if the deleted one was active
      setChats(updatedChats);
      if (activeChat === chatId) {
        setActiveChat(updatedChats[0].id);
        setFile(updatedChats[0].file || null);
        setFullText(updatedChats[0].fullText || "");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "white" }}>
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
          height: "100%",
          ml: sidebarOpen ? "300px" : "10px", // ← slide right
          transition: "margin-left 0.1s ease", // ← animation
        }}
      >
        <ChatHeader
          title={currentChat.title}
          file={file}
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        <MessageList
          messages={currentChat.messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
        />

        <InputArea
          userInput={userInput}
          onInputChange={setUserInput}
          onSend={handleSend}
          onFileUpload={handleFileChange}
          suggestions={suggestions}
          loading={loading}
        />
      </Box>
    </Box>
  );
}

export default App;
