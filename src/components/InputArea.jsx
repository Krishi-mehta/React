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
import SendIcon from "@mui/icons-material/Send";
import SmartSuggestions from "./SmartSuggestions";

function InputArea({
  userInput,
  onInputChange,
  onSend,
  fullText,
  loading,
}) {
  const textFieldRef = useRef(null);
  const inputElementRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Safe color access with fallbacks
  const primaryColor = theme.palette.primary.main || "#7247EE";
  const primaryDarkColor = theme.palette.primary.dark || "#5A3AA6";
  const borderColor = theme.palette.divider || "#E0E0E0";
  const hoverBorderColor = theme.palette.action.hoverBorder || "#BDBDBD";
  const disabledBgColor = theme.palette.action.disabledBackground || "#E0E0E0";
  const disabledColor = theme.palette.action.disabled || "#BDBDBD";
  const textColor = theme.palette.text.primary || "#343541";

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
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
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
          width: { xs: "95%", sm: "85%", md: "70%", lg: "60%" },
          maxWidth: "800px",
          position: "relative",
          alignItems: "center"
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            borderRadius: "18px",
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${borderColor}`,
            transition: theme.transitions.create(['border-color', 'box-shadow'], {
              duration: theme.transitions.duration.short,
            }),
            "&:hover": {
              borderColor: hoverBorderColor,
            },
            "&:focus-within": {
              backgroundColor: theme.palette.background.paper,
              borderColor: primaryColor,
              boxShadow: `0 0 0 1px ${primaryColor}`,
            },
            minHeight: { xs: "36px", sm: "40px" },
            padding: { xs: "0px 10px 0px 10px", sm: "0px 10px 0px 10px" },
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
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'center',
              },
              "& .MuiOutlinedInput-input": {
                padding: "0",
                color: textColor,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                lineHeight: 1.3,
                flexGrow: 1,
                minHeight: '10px',
              },
            }}
          />

          <Tooltip title="Send" enterDelay={500}>
            <IconButton
              onClick={onSend}
              disabled={loading || !userInput.trim()}
              sx={{
                flexShrink: 0,
                backgroundColor: primaryColor,
                color: theme.palette.common.white,
                width: { xs: 32, sm: 34 },
                height: { xs: 32, sm: 34 },
                "&:hover": {
                  backgroundColor: primaryDarkColor,
                },
                "&:disabled": {
                  backgroundColor: disabledBgColor,
                  color: disabledColor,
                },
                borderRadius: "50%",
                transition: theme.transitions.create(['background-color'], {
                  duration: theme.transitions.duration.short,
                }),
                ml: { xs: 0.8, sm: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[1],
              }}
            >
              <SendIcon sx={{ fontSize: { xs: 'small', sm: 'small' } }} />
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