import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';

function I18nTest() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        i18n Test Component
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Current Language: {i18n.language}
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Test Translation: {t('chat.newChat')}
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        File Upload: {t('file.uploadFile')}
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => changeLanguage('English')}
        >
          English
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => changeLanguage('Chinese')}
        >
          中文
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => changeLanguage('Spanish')}
        >
          Español
        </Button>
      </Box>
    </Box>
  );
}

export default I18nTest; 