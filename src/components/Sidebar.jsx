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
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // For chat list icon

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
          width: { xs: "100vw", sm: 300 }, // Keeping your original width
          maxWidth: "100vw", // Keeping your original max-width
          padding: { xs: 1, sm: 2 }, // Keeping your original padding
          // Pinterest-like light background for the sidebar
          bgcolor: "#f8f8f8", // Very light grey, almost white
          color: "#333333", // Dark text for light background
          boxSizing: "border-box",
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Subtle shadow for depth
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2} // Keeping your original margin
        >
          <Typography
            fontWeight="bold"
            fontSize={{ xs: "1rem", sm: "1.25rem" }} // Keeping your original font size
            sx={{
              color: "#e60023", // Pinterest red for the "Menu" title
            }}
          >
            PDF GPT
          </Typography>
          <IconButton onClick={onClose} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
            <CloseIcon sx={{ color: "#767676" }} /> {/* Darker icon color for light background */}
          </IconButton>
        </Box>

        {/* New Chat Button - Pinterest Style */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            mb: 2, // Keeping your original margin
            bgcolor: "#e60023", // Pinterest red for the new chat button
            color: "#fff",
            fontSize: { xs: "0.75rem", sm: "0.9rem" }, // Keeping your original font size
            borderRadius: 8, // More rounded for Pinterest feel (like a pill)
            py: 1.2, // Slightly more vertical padding for button, for a clickier feel
            boxShadow: '0 2px 5px rgba(230,0,35,0.3)', // Subtle red shadow
            '&:hover': {
              bgcolor: "#b3001a", // Darker red on hover
              boxShadow: '0 4px 10px rgba(230,0,35,0.4)', // Slightly more pronounced shadow on hover
            },
          }}
          onClick={onNewChat}
        >
          + New Chat
        </Button>

        {/* Divider - Pinterest Style */}
        <Divider sx={{
          borderColor: "rgba(0,0,0,0.1)", // Very subtle dark border for light background
          bgcolor: "transparent",
          mb: 2 // Keeping your original margin
        }} />

        {/* Chat List */}
        <List disablePadding>
          {chats.map((chat) => (
            <ListItem
              key={chat.id}
              sx={{
                // Active chat background: slightly darker light grey for contrast
                backgroundColor: chat.id === activeChat ? "#ededed" : "transparent", // Very light grey for active, transparent for inactive
                color: chat.id === activeChat ? "#333333" : "#767676", // Dark text for active, muted grey for inactive
                mb: 1, // Keeping your original margin
                p: 1.5, // Keeping your original padding
                borderRadius: 4, // More rounded corners for list items
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "background-color 0.2s, color 0.2s",
                '&:hover': {
                  backgroundColor: "#f0f0f0", // Slightly darker light grey on hover
                  color: "#333333", // Ensure text is dark on hover
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
                    // White background for the edit field
                    backgroundColor: "#ffffff",
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
                        color: "#333333", // Dark text for edit field
                        fontSize: "0.9rem", // Retaining original font size
                        px: 1,
                      },
                    }}
                    autoFocus
                  />
                </Box>
              ) : (
                <>
                  <ChatBubbleOutlineIcon
                    sx={{
                      mr: 1.5, // Space between icon and text
                      color: chat.id === activeChat ? "#e60023" : "#a0a0a0", // Pinterest red for active, softer grey for inactive
                      fontSize: "small", // Keeping small size
                    }}
                  />
                  <ListItemText
                    primary={chat.title}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: { xs: "0.75rem", sm: "1rem" }, // Keeping original font size
                        fontWeight: chat.id === activeChat ? 600 : 400, // Bolder for active chat
                        // Color inherited from ListItem
                      },
                    }}
                  />
                  {(hoveredChatId === chat.id || editingChatId === chat.id) && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5, // Retaining original gap
                        opacity: 1,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(chat);
                        }}
                        sx={{
                            color: "#767676", // Muted grey icons for light background
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)', // Subtle hover background
                                color: "#333333", // Darker on hover
                            }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(chat.id);
                        }}
                        sx={{
                            color: "#767676", // Muted grey icons
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)', // Subtle hover background
                                color: "#333333", // Darker on hover
                            }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
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