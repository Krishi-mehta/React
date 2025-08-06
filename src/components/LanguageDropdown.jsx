import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  Typography,
  useTheme,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const languages = [
  { code: 'English', name: 'English' },
  { code: 'Chinese', name: '中文' },
  { code: 'Japanese', name: '日本語' },
  { code: 'Spanish', name: 'Español' },
  { code: 'French', name: 'Français' },
  { code: 'German', name: 'Deutsch' },
  { code: 'Italian', name: 'Italiano' },
  { code: 'Dutch', name: 'Nederlands' },
  { code: 'Korean', name: '한국어' },
  { code: 'Portuguese', name: 'Português' },
  { code: 'Russian', name: 'Русский' },
  { code: 'Arabic', name: 'العربية' },
  { code: 'Turkish', name: 'Türkçe' },
  { code: 'Hindi', name: 'हिन्दी' },
];

function LanguageDropdown({ selectedLanguage, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleChange = (event) => {
    onLanguageChange(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon 
        sx={{ 
          color: theme.palette.text.secondary, 
          fontSize: '1.2rem' 
        }} 
      />
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused': {
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiSelect-select': {
            py: 0.5,
            px: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.palette.text.primary,
          },
          '& .MuiSelect-icon': {
            color: theme.palette.text.secondary,
          },
        }}
      >
        <Select
          value={selectedLanguage}
          onChange={handleChange}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          displayEmpty
          renderValue={(value) => (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {value}
            </Typography>
          )}
        >
          {languages.map((language) => (
            <MenuItem 
              key={language.code} 
              value={language.code}
              sx={{
                fontSize: '0.875rem',
                py: 1,
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              {language.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default LanguageDropdown; 