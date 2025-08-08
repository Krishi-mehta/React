import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import InputArea from "../components/InputArea";
import { useChat } from "../reducers/hooks";

function ChatView({
  chats,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onRemoveFile,
  userInput,
  setUserInput,
  loading,
  onSendMessage,
  onStopGeneration,
  onEditMessage,
  onCancelEdit,
  isEditing,
  selectedLanguage,
  onLanguageChange,
  t,
}) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentChat = useChat(chatId);

  useEffect(() => {
    if (!currentChat && chatId !== "new") {
      console.warn(
        `Chat with ID ${chatId} not found in current session. Redirecting to new chat.`
      );
      // The setTimeout here is actually a good way to avoid the render loop
      // and ensure the navigation happens after the current render cycle.
      const timer = setTimeout(() => {
        navigate("/chat/new", { replace: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentChat, chatId, navigate]);

  // THIS IS THE MOST IMPORTANT CHANGE.
  // We return early and render nothing but a loading state if the chat data is not ready.
  // This prevents any attempt to access properties of `currentChat`.
  if (!currentChat || (chatId !== "new" && !currentChat)) {
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

  // Once we are sure `currentChat` is defined, we can safely render the rest of the component.
  return (
    <>
      <ChatHeader
        title={currentChat.title}
        file={currentChat.file}
        fileData={currentChat.file?.data} // FIX: Pass the file data
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        onRemoveFile={onRemoveFile}
        processingComplete={currentChat.processingComplete !== false}
        processingError={currentChat.processingError || false}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
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
        isEditing={isEditing}
        onCancelEdit={onCancelEdit}
      />
    </>
  );
}

export default ChatView;