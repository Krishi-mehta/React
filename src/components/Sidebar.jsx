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
import { Tooltip } from "@mui/material";

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
          width: 320,
          padding: "16px 12px",
          bgcolor: "#0f172a",

          color: "#fff",
          transition: "transform 0.3s ease",
        },
      }}
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          // sx={{ p: { xs: 1, sm: 2 } }}
        >
          <Typography fontWeight="bold">Menu</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>

        <Button
          fullWidth
          variant="contained"
          sx={{
            my: { xs: 1, sm: 2 },
            // border: "1px solid #e0e0e0",
            bgcolor: "#1e293b", // dark slate background
            color: "#fff", // white text
            "&:hover": {
              bgcolor: "#334155", // slightly lighter on hover
            },
          }}
          onClick={onNewChat}
        >
          + New Chat
        </Button>

        <Divider
          sx={{
            borderColor: "#e0e0e0",
            bgcolor: "#334155",
          }}
        />

        <List>
          {chats.map((chat) => (
            <ListItem
            key={chat.id}
            sx={{
              backgroundColor: chat.id === activeChat ? "#1a1a2e" : "#1e293b",
              color: "#fff",
              mb: 1,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
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
      backgroundColor: "#1f2937", // Tailwind's bg-gray-800
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
    <Box sx={{ display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.2s", ".MuiListItem-root:hover &": { opacity: 1 } }}>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleEditClick(chat)
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
