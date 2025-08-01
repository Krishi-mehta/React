import React, { useState, useEffect } from "react";
import { 
  Popper, 
  Paper, 
  MenuList, 
  MenuItem, 
  ClickAwayListener,
  useTheme 
} from "@mui/material";

function SmartSuggestions({ userInput, fullText, onInputChange, anchorEl }) {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  // Define colors with theme fallbacks
  const colors = {
    bgColor: theme.palette.background.paper || '#ffffff',
    borderColor: theme.palette.divider || '#e5e7eb',
    textColor: theme.palette.text.primary || '#374151',
    hoverBg: theme.palette.action.hover || '#f3f4f6',
    selectedBg: theme.palette.action.selected || '#eff6ff',
    selectedText: theme.palette.primary.main || '#1d4ed8',
    selectedHoverBg: theme.palette.action.selected || '#dbeafe',
    shadow: theme.shadows[4] || '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)'
  };

  useEffect(() => {
    if (!userInput.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let words = [];
    if (fullText && fullText !== "Error extracting text from PDF") {
      words = fullText.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    }
    const uniqueTerms = [...new Set(words)];

    const inputLower = userInput.toLowerCase();
    const matchingTerms = uniqueTerms.filter((term) => term.includes(inputLower));

    const templates = [
      (term) => `What is ${term}?`,
      (term) => `How is ${term} used?`,
      (term) => `Explain ${term} in the context of the document`,
      (term) => `What information involves ${term}?`,
    ];

    let allSuggestions = [];
    if (matchingTerms.length > 0) {
      allSuggestions = matchingTerms
        .slice(0, 8)
        .flatMap((term) => templates.map((t) => t(term)))
        .slice(0, 4);
    } else {
      const availableTerms = uniqueTerms.length > 0 ? uniqueTerms : ["content", "information", "details", "summary"];
      const questionStems = [
        "What is the main",
        "Can you explain",
        "What does this document say about",
        "Tell me about",
      ];
      allSuggestions = availableTerms
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .flatMap((term) =>
          questionStems.sort(() => 0.5 - Math.random()).slice(0, 1).map((stem) => `${stem} ${term}?`)
        )
        .filter(s => s.toLowerCase().includes(inputLower))
        .slice(0, 4);
    }

    setSuggestions(allSuggestions);
    setIsOpen(allSuggestions.length > 0);
  }, [userInput, fullText]);

  const handleSuggestionClick = (suggestion) => {
    onInputChange(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  useEffect(() => {
    if (anchorEl) {
      anchorEl.addEventListener("keydown", handleKeyDown);
      return () => anchorEl.removeEventListener("keydown", handleKeyDown);
    }
  }, [anchorEl, isOpen, suggestions]);

  if (!isOpen || !anchorEl) return null;

  return (
    <Popper 
      open={isOpen} 
      anchorEl={anchorEl} 
      placement="top-start" 
      sx={{ 
        zIndex: theme.zIndex.tooltip, 
        width: anchorEl.offsetWidth,
        mt: -1
      }}
    >
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <Paper
          elevation={3}
          sx={{
            maxHeight: 240,
            overflowY: "auto",
            borderRadius: 2,
            bgcolor: colors.bgColor,
            boxShadow: colors.shadow,
            border: `1px solid ${colors.borderColor}`,
          }}
        >
          <MenuList sx={{ py: 0.5 }}>
            {suggestions.map((suggestion, index) => (
              <MenuItem
                key={index}
                selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  fontSize: "0.875rem",
                  color: colors.textColor,
                  py: 1.5,
                  px: 2,
                  minHeight: 'auto',
                  '&:hover': {
                    backgroundColor: colors.hoverBg,
                  },
                  '&.Mui-selected': {
                    backgroundColor: colors.selectedBg,
                    color: colors.selectedText,
                    '&:hover': {
                      backgroundColor: colors.selectedHoverBg,
                    },
                  },
                  fontWeight: index === selectedIndex ? 500 : 400,
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                }}
              >
                {suggestion}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}

export default SmartSuggestions;