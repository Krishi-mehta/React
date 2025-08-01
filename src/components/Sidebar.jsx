import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  IconButton,
  TextField,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

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
  isStatic = false
}) {
  const theme = useTheme();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState(null);

  // Exact color definitions matching current appearance
  const colors = {
    sidebarBg: "#1f1e1d",
    sidebarText: "#ffffff",
    divider: "#333333",
    primary: "#6366F1",
    primaryHover: "#5A5FE0",
    secondaryText: "#9CA3AF",
    icon: "#6B7280",
    hoverBg: "rgba(255,255,255,0.05)",
    activeChatBg: "rgba(99, 102, 241, 0.1)",
    activeChatHoverBg: "rgba(99, 102, 241, 0.15)",
    editBg: "rgba(255,255,255,0.1)"
  };

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
          width: 280,
          maxWidth: "100vw", 
          padding: 0,
          bgcolor: colors.sidebarBg,
          color: colors.sidebarText,
          boxSizing: "border-box",
          borderRight: `1px solid ${colors.divider}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: colors.primary,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>
              FM
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "18px",
              color: colors.sidebarText,
            }}
          >
            FileMentor
          </Typography>
        </Box>
        
        {!isStatic && (
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: colors.secondaryText,
              '&:hover': { 
                bgcolor: colors.hoverBg,
                color: colors.sidebarText
              } 
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: colors.primary,
            color: colors.sidebarText,
            fontSize: "14px",
            borderRadius: "8px",
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primaryHover,
            },
          }}
          onClick={onNewChat}
        >
          + New chat
        </Button>
      </Box>

      {/* Chat List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
        {chats.length > 0 && (
          <>
            <Typography
              sx={{
                color: colors.secondaryText,
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 1,
                px: 1,
              }}
            >
              Today
            </Typography>
            
            <List disablePadding>
              {chats.map((chat) => (
                <ListItem
                  key={chat.id}
                  sx={{
                    backgroundColor: chat.id === activeChat ? colors.activeChatBg : "transparent",
                    color: chat.id === activeChat ? colors.sidebarText : colors.secondaryText,
                    mb: 0.5,
                    p: 1,
                    borderRadius: "8px",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    '&:hover': {
                      backgroundColor: chat.id === activeChat ? colors.activeChatHoverBg : colors.hoverBg,
                      color: colors.sidebarText,
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
                        backgroundColor: colors.editBg,
                        borderRadius: "4px",
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
                            color: colors.sidebarText,
                            fontSize: "14px",
                          },
                        }}
                        autoFocus
                      />
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0 }}>
                        <ChatBubbleOutlineIcon
                          sx={{
                            mr: 1.5,
                            color: chat.id === activeChat ? colors.primary : colors.icon,
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={chat.title}
                          primaryTypographyProps={{
                            sx: {
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "14px",
                              fontWeight: chat.id === activeChat ? 500 : 400,
                            },
                          }}
                        />
                      </Box>
                      {hoveredChatId === chat.id && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
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
                              color: colors.secondaryText,
                              '&:hover': {
                                bgcolor: colors.hoverBg,
                                color: colors.sidebarText,
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(chat.id);
                            }}
                            sx={{
                              color: colors.secondaryText,
                              '&:hover': {
                                bgcolor: colors.hoverBg,
                                color: colors.sidebarText,
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: "14px" }} />
                          </IconButton>
                        </Box>
                      )}
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default Sidebar;