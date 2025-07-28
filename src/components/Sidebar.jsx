import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function Sidebar({
  open,
  onClose,
  chats,
  activeChat,
  onNewChat,
  onChatSelect,
  isMobile,
  onEdit,
  onDelete,
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState(null);

  const handleEditClick = (chat) => {
    setEditingChatId(chat.id);
    setEditedTitle(chat.title);
  };

  const handleSaveEdit = (chatId) => {
    onEdit(chatId, editedTitle);
    setEditingChatId(null);
    setEditedTitle("");
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditedTitle("");
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 300 }, // full screen on mobile
          maxWidth: "100vw",
          padding: { xs: 1, sm: 2 },
          bgcolor: "#0f172a",
          color: "#fff",
          boxSizing: "border-box",
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography fontWeight="bold" fontSize={{ xs: "1rem", sm: "1.25rem" }}>
            Menu
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>

        {/* New Chat */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mb: 2,
            bgcolor: "#1e293b",
            color: "#fff",
            fontSize: { xs: "0.75rem", sm: "0.9rem" },
            "&:hover": {
              bgcolor: "#334155",
            },
          }}
          onClick={onNewChat}
        >
          + New Chat
        </Button>

        <Divider sx={{ borderColor: "#e0e0e0", bgcolor: "#334155", mb: 2 }} />

        {/* Chat List */}
        <List disablePadding>
          {chats.map((chat) => (
            <ListItem
              key={chat.id}
              sx={{
                backgroundColor: chat.id === activeChat ? "#1a1a2e" : "#1e293b",
                color: "#fff",
                mb: 1,
                p: 1.5,
                borderRadius: 2,
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#334155",
                },
              }}
              onClick={() => onChatSelect(chat.id)}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
            >
              {editingChatId === chat.id ? (
                <Box
                  sx={{
                    flexGrow: 1,
                    backgroundColor: "#1f2937",
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(chat.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    onBlur={() => handleSaveEdit(chat.id)}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        color: "#fff",
                        fontSize: "0.9rem",
                        px: 1,
                      },
                    }}
                  />
                </Box>
              ) : (
                <>
                  <ListItemText
                    primary={chat.title}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: { xs: "0.75rem", sm: "1rem" },
                        color: activeChat === chat.id ? "white" : "gray",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      opacity: hoveredChatId === chat.id ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(chat);
                      }}
                    >
                      <EditIcon sx={{ color: "#fff" }} fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat.id);
                      }}
                    >
                      <DeleteIcon sx={{ color: "#fff" }} fontSize="small" />
                    </IconButton>
                  </Box>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
