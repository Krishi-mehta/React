import React, { useRef } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import SmartSuggestions from "./SmartSuggestions";

function InputArea({
  userInput,
  onInputChange,
  onSend,
  onFileUpload,
  fullText,
  loading,
}) {
  const fileInputRef = useRef(null);
  const textFieldRef = useRef(null);

  // console.log("InputArea - userInput:", userInput, "fullText:", fullText); // Debug props

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "white",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        sx={{
          width: "70%",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => fileInputRef.current.click()}
          sx={{
            border: "1px dashed #e0e0e0",
            borderRadius: "50%",
            width: 40,
            height: 40,
          }}
        >
          <UploadFileIcon />
        </IconButton>

        <input
          type="file"
          hidden
          accept=".pdf"
          ref={fileInputRef}
          onChange={onFileUpload}
          sx={{
            padding: "20px",
          }}
        />

        <Box sx={{ width: "100%", position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Ask a question..."
            value={userInput}
            onChange={(e) => {
              // console.log("Input changed to:", e.target.value); // Debug input
              onInputChange(e.target.value);
            }}
            multiline
            maxRows={4}
            inputRef={textFieldRef} // Ensure ref is on the input element
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                paddingRight: "56px",
                border: "1px solid #e0e0e0",
                bgcolor: "white",
                height: "50px",
              },
            }}
          />

          <IconButton
            color="primary"
            onClick={onSend}
            disabled={loading || !userInput.trim()}
            sx={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "text.primary",
            }}
          >
            <SendIcon />
          </IconButton>

          <SmartSuggestions
            userInput={userInput}
            fullText={fullText}
            onInputChange={onInputChange}
            anchorEl={textFieldRef.current} // Pass the ref directly
          />
        </Box>
      </Box>
    </Box>
  );
}

export default InputArea;
