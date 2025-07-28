import React, { useState, useEffect, useRef } from "react";
import { Popper, Paper, MenuList, MenuItem, ClickAwayListener } from "@mui/material";

function SmartSuggestions({ userInput, fullText, onInputChange, anchorEl }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // console.log("SmartSuggestions - userInput:", userInput, "fullText:", fullText);
    if (!userInput.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      console.log("No suggestions due to empty input");
      return;
    }

    let words = [];
    if (fullText && fullText !== "Error extracting text from PDF") {
      words = fullText.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    }
    const uniqueTerms = [...new Set(words)];
    // console.log("Extracted words:", uniqueTerms);

    const inputLower = userInput.toLowerCase();
    const matchingTerms = uniqueTerms.filter((term) => term.includes(inputLower));
    // console.log("Matching terms:", matchingTerms);

    const templates = [
      (term) => `What is ${term}?`,
      (term) => `How is ${term} used?`,
      (term) => `Explain ${term} in the context of the resume`,
      (term) => `What experience involves ${term}?`,
    ];

    let allSuggestions = [];
    if (matchingTerms.length > 0) {
      allSuggestions = matchingTerms
        .slice(0, 10)
        .flatMap((term) => templates.map((t) => t(term)))
        .slice(0, 5);
    } else {
      // Dynamically generate suggestions from resume words or fallback words
      const availableTerms = uniqueTerms.length > 0 ? uniqueTerms : ["skills", "experience", "projects", "education"];
      const questionStems = [
        "What is your",
        "How do you use",
        "Can you explain",
        "What experience do you have with",
      ];
      allSuggestions = availableTerms
        .sort(() => 0.5 - Math.random()) // Randomize terms
        .slice(0, 5)
        .flatMap((term) =>
          questionStems.sort(() => 0.5 - Math.random()).slice(0, 1).map((stem) => `${stem} ${term}?`)
        )
        .filter(s => s.toLowerCase().includes(inputLower))
        .slice(0, 5);
    }

    // console.log("Generated suggestions:", allSuggestions);
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

  // console.log("Rendering Popper - anchorEl:", anchorEl, "isOpen:", isOpen);
  if (!isOpen || !anchorEl) return null;

  return (
    <Popper open={isOpen} anchorEl={anchorEl} placement="top-start" sx={{ zIndex: 1300, width: anchorEl.offsetWidth }}>
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <Paper elevation={3} sx={{ maxHeight: 200, overflowY: "auto", borderRadius: 2 }}>
          <MenuList>
            {suggestions.map((suggestion, index) => (
              <MenuItem
                key={index}
                selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  fontSize: "0.9rem",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                  backgroundColor: index === selectedIndex ? "#e0e0e0" : "inherit",
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