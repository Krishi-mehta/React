import React, { useRef } from "react";
import { Box, IconButton, TextField } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import SuggestionsMenu from "./SuggestionsMenu";

function InputArea({
  userInput,
  onInputChange,
  onSend,
  onFileUpload,
  suggestions,
  loading
}) {
  const fileInputRef = useRef(null);

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: "white", 
      borderTop: "1px solid #e0e0e0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Box 
        display="flex" 
        gap={2} 
        alignItems="center" 
        sx={{ 
          width: "70%",
          position: "relative"
        }}
      >
        <IconButton
          onClick={() => fileInputRef.current.click()}
          sx={{ 
            border: "1px dashed #e0e0e0",
            borderRadius: "50%",
            width: 40,
            height: 40
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
            padding:"20px"
          }}
        />
        
        <TextField
          fullWidth
          placeholder="Ask a question..."
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSend()}
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              paddingRight: "56px",
              border: "1px solid #e0e0e0",
              bgcolor: "white",
              height:"50px",
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
            color: "text.primary"
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {suggestions.length > 0 && (
        <SuggestionsMenu 
          suggestions={suggestions} 
          onSelect={onInputChange} 
        />
      )}
    </Box>
  );
}

export default InputArea;