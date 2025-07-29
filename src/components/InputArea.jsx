import React, { useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import SmartSuggestions from "./SmartSuggestions";

function InputArea({
  userInput,
  onInputChange,
  onSend,
  onFileUpload,
  onImageUpload,
  fullText,
  loading,
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textFieldRef = useRef(null);
  const inputElementRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (inputElementRef.current && inputElementRef.current.contains(document.activeElement)) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (userInput.trim() && !loading) {
            onSend();
          }
        }
      }
    };

    const inputDomElement = inputElementRef.current;
    if (inputDomElement) {
      inputDomElement.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (inputDomElement) {
        inputDomElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [userInput, onSend, loading]);

  return (
    <Box
      sx={{
        p: { xs: 0.8, sm: 1.2 },
        bgcolor: "#ffffff",
        borderTop: "1px solid #efefef",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "sticky",
        bottom: 0,
        zIndex: 999,
      }}
    >
      <Box
        display="flex"
        gap={1}
        alignItems="flex-end"
        sx={{
          width: { xs: "95%", sm: "85%", md: "70%", lg: "90%" },
          maxWidth: "800px",
          position: "relative",
          alignItems:"center"
        }}
      >
        {/* Upload Button */}
        <Tooltip title="Upload PDF" enterDelay={500}>
          <IconButton
            onClick={() => fileInputRef.current.click()}
            sx={{
              flexShrink: 0,
              color: "#767676",
              backgroundColor: "transparent",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#e60023",
                borderColor: "#e60023",
                color: "#ffffff",
                transform: "scale(1.05)",
              },
              borderRadius: "50%",
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Ensure the icon size is appropriate for the button size */}
            <UploadFileIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          </IconButton>
        </Tooltip>

        <input
          type="file"
          hidden
          accept=".pdf,.doc,.docx,.txt,image/*"
          ref={fileInputRef}
          onChange={onFileUpload}
        />

        {/* Input + Send Button Container (Pill Shape) */}
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            borderRadius: "24px",
            backgroundColor: "#efefef",
            border: "1px solid #e0e0e0",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#bdbdbd",
              backgroundColor: "#e0e0e0",
            },
            "&:focus-within": {
              backgroundColor: "#ffffff",
              borderColor: "#e60023",
              boxShadow: "0 0 0 2px rgba(230, 0, 35, 0.25)",
            },
            minHeight: { xs: "38px", sm: "40px" },
            padding: { xs: "0px 8px 0px 12px", sm: "2px 8px 2px 14px" },
            position: "relative",
          }}
          ref={textFieldRef}
        >
          <TextField
            fullWidth
            placeholder="Ask a question..."
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            multiline
            minRows={1}
            maxRows={isMobile ? 3 : 5}
            inputRef={inputElementRef}
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "none",
                borderRadius: "0",
                backgroundColor: "transparent",
                height: "auto",
                paddingRight: "0 !important",
                alignItems: "center",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiInputBase-inputMultiline": {
                padding: "0 !important",
                lineHeight: 1.4,
              },
              "& .MuiOutlinedInput-input": {
                padding: "0",
                color: "#333333",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                lineHeight: 1.4,
                flexGrow: 1,
                minHeight: '1.4em',
              },
            }}
          />

          <Tooltip title="Send" enterDelay={500}>
            <IconButton
              onClick={onSend}
              disabled={loading || !userInput.trim()}
              sx={{
                flexShrink: 0,
                backgroundColor: "#e60023",
                color: "#ffffff",
                width: { xs: 30, sm: 32 },
                height: { xs: 30, sm: 32 },
                "&:hover": {
                  backgroundColor: "#cc001a",
                  transform: "scale(1.05)",
                },
                "&:disabled": {
                  backgroundColor: "#f0f0f0",
                  color: "#bdbdbd",
                },
                borderRadius: "50%",
                transition: "all 0.2s ease-in-out",
                ml: { xs: 0.5, sm: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SendIcon sx={{ fontSize: { xs: 'small', sm: 'medium' } }} />
            </IconButton>
          </Tooltip>
        </Paper>

        <SmartSuggestions
          userInput={userInput}
          fullText={fullText}
          onInputChange={onInputChange}
          anchorEl={inputElementRef.current}
        />
      </Box>
    </Box>
  );
}

export default InputArea;