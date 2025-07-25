import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function SuggestionsMenu({ suggestions, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box mt={2} sx={{ width: "80%" }}>
      <Button
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: 'none',
          color: 'text.secondary',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '0.875rem'
        }}
      >
        Suggested questions
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: '40ch',
            maxHeight: 200,
          },
        }}
      >
        {suggestions.map((suggestion, index) => (
          <MenuItem 
            key={index} 
            onClick={() => {
              onSelect(suggestion);
              handleClose();
            }}
            sx={{ whiteSpace: 'normal' }}
          >
            {suggestion}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default SuggestionsMenu;