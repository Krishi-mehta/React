import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import NewChatView from "./NewChatView";
import ChatView from "./ChatView";
import { useChatContainer } from "../hooks/useChatContainer";
import { useTheme } from "@mui/material";

const ACCENT_COLOR = "#64B5F6";
const ACCENT_COLOR_HOVER = "#42A5F5";

function ChatContainer({ mode, setMode }) {
  const {
    dispatch,
    chats,
    chatId,
    t,
    fileUploadLoading,
    userInput,
    sidebarOpen,
    setSidebarOpen,
    dragOver,
    selectedLanguage,
    isMobile,
    isNewChatPath,
    currentChat,
    currentChatLoading,
    editingMessageIndex, // Add this
    handleFileUpload,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleEditMessage,
    handleCancelEdit, // Add this
    onSendMessage,
    handleNewChat,
    handleChatSelect,
    handleEditChatTitle,
    handleDeleteChat,
    handleRemoveFile,
    handleLanguageChange,
    stopGeneration,
  } = useChatContainer({ mode, setMode });

  const sidebarWidth = 280;
  const theme = useTheme();

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
            t={t}
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
            onCancelEdit={handleCancelEdit} // Add this
            isEditing={editingMessageIndex !== null} // Add this
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            t={t}
          />
        )}
      </Box>
    </Box>
  );
}

export default ChatContainer;
