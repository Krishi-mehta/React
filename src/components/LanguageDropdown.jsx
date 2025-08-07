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
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'English', name: 'English', nativeName: 'English' },
  { code: 'Chinese', name: 'Chinese', nativeName: '中文' },
  { code: 'Japanese', name: 'Japanese', nativeName: '日本語' },
  { code: 'Spanish', name: 'Spanish', nativeName: 'Español' },
  { code: 'French', name: 'French', nativeName: 'Français' },
  { code: 'German', name: 'German', nativeName: 'Deutsch' },
  { code: 'Italian', name: 'Italian', nativeName: 'Italiano' },
  { code: 'Dutch', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'Korean', name: 'Korean', nativeName: '한국어' },
  { code: 'Portuguese', name: 'Portuguese', nativeName: 'Português' },
  { code: 'Russian', name: 'Russian', nativeName: 'Русский' },
  { code: 'Arabic', name: 'Arabic', nativeName: 'العربية' },
  { code: 'Turkish', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी' },
];

function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { i18n } = useTranslation();

  // Get current language, default to 'English' if not found
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    
    // Save language preference to localStorage
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('selectedLanguage', newLanguage);
    }
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
          value={currentLanguage.code}
          onChange={handleChange}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          displayEmpty
          renderValue={(value) => {
            const selectedLang = languages.find(lang => lang.code === value);
            return (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
              >
                {selectedLang ? selectedLang.nativeName : 'English'}
              </Typography>
            );
          }}
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
              {language.nativeName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default LanguageDropdown;