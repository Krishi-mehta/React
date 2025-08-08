import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Slide,
  Typography,
  useTheme,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  ContentCopy,
  Close,
  ErrorOutline,
  Download,
  Fullscreen,
  FullscreenExit,
  OpenInNew,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FilePreview = ({ open, onClose, file }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset state when file changes or modal opens
  useEffect(() => {
    if (open && file) {
      setScale(isMobile ? 0.8 : 1.0);
      setRotation(0);
      setSelectedText('');
      setLoading(true);
      setError(null);
      setIsFullscreen(false);
    }
  }, [open, file, isMobile]);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.3));
  };

  const handleRotateLeft = () => {
    setRotation((prevRotation) => (prevRotation - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  const handleCopyText = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleDownload = () => {
    if (file?.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (file?.data) {
      window.open(file.data, '_blank');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  // File type detection
  const isImage = file?.type?.startsWith('image/');
  const isPDF = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
  const isText = file?.type === 'text/plain' || file?.name?.toLowerCase().endsWith('.txt');
  const isDocument = file?.type?.includes('document') || file?.name?.toLowerCase().endsWith('.docx');
  
  const fileData = file?.data;

  // Color scheme
  const colors = {
    background: theme.palette.background.paper,
    surface: theme.palette.background.default,
    text: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    border: theme.palette.divider,
    primary: theme.palette.primary.main,
    error: theme.palette.error.main,
  };

  // Width calculation
  const previewWidth = isFullscreen ? '100%' : isMobile ? '100%' : '50%';
  const previewHeight = isFullscreen ? '100vh' : '100vh';

  if (!file) {
    return (
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: previewWidth,
            height: previewHeight,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: colors.background,
          }}
        >
          <ErrorOutline sx={{ fontSize: 40, color: colors.error, mb: 2 }} />
          <Typography variant="body2" color="error">
            {t('file.noFileSelected')}
          </Typography>
          <IconButton onClick={handleClose} sx={{ mt: 2 }}>
            <Close />
          </IconButton>
        </Paper>
      </Slide>
    );
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: previewWidth,
          height: previewHeight,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: colors.background,
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: theme.shadows[8],
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: { xs: 1, sm: 1.5 },
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            minHeight: 56,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: colors.text,
              maxWidth: '60%',
            }}
          >
            {file?.name || 'File Preview'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={t('file.downloadFile')}>
              {/* <IconButton onClick={handleDownload} size="small">
                <Download />
              </IconButton> */}
            </Tooltip>
            {/* {isPDF && (
              <Tooltip title="Open in New Tab">
                <IconButton onClick={handleOpenInNewTab} size="small">
                  <OpenInNew />
                </IconButton>
              </Tooltip>
            )} */}
            <Tooltip title={isFullscreen ? t('file.exitFullscreen') : t('file.fullscreen')}>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('file.closePreview')}>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Toolbar - Only show for images */}
        {isImage && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: { xs: 0.5, sm: 1 },
              borderBottom: `1px solid ${colors.border}`,
              gap: { xs: 0.5, sm: 1 },
              bgcolor: colors.surface,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              minHeight: 48,
            }}
          >
            <Tooltip title={t('file.zoomIn')}>
              <IconButton onClick={handleZoomIn} size="small" disabled={scale >= 3.0}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('file.zoomOut')}>
              <IconButton onClick={handleZoomOut} size="small" disabled={scale <= 0.3}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('file.rotateLeft')}>
              <IconButton onClick={handleRotateLeft} size="small">
                <RotateLeft />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('file.rotateRight')}>
              <IconButton onClick={handleRotateRight} size="small">
                <RotateRight />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('file.copySelectedText')}>
              <span>
                <IconButton
                  onClick={handleCopyText}
                  size="small"
                  disabled={!selectedText}
                >
                  <ContentCopy />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}

        {/* Content Area */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1, sm: 2 },
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
            position: 'relative',
          }}
          onMouseUp={handleTextSelection}
        >
          {/* PDF Preview using iframe/embed */}
          {isPDF && fileData && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <iframe
                src={`${fileData}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2],
                }}
                title={file?.name || 'PDF Preview'}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError('Failed to load PDF. Please try opening it in a new tab.');
                  setLoading(false);
                }}
              />
            </Box>
          )}

          {/* Image Preview */}
          {isImage && fileData && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <img
                src={fileData}
                alt={file?.name || 'Preview'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  objectFit: 'contain',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2],
                }}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError(t('file.failedToLoadImage'));
                  setLoading(false);
                }}
              />
            </Box>
          )}

          {/* Text File Preview */}
          {isText && fileData && (
            <TextFilePreview
              fileData={fileData}
              fileName={file?.name}
              onLoad={() => setLoading(false)}
              onError={(error) => {
                setError(error);
                setLoading(false);
              }}
              colors={colors}
            />
          )}

          {/* Document Files (DOCX, etc.) */}
          {isDocument && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                p: 2,
                textAlign: 'center',
              }}
            >
              <ErrorOutline sx={{ fontSize: 48, color: colors.textSecondary }} />
              <Typography variant="h6" color="textSecondary">
                {t('file.previewNotAvailable')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('file.unsupportedFileType')}
                <br />
                You can download the file to view it in an appropriate application.
              </Typography>
              <IconButton
                onClick={handleDownload}
                sx={{
                  bgcolor: colors.primary,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  mt: 2,
                }}
              >
                <Download />
              </IconButton>
            </Box>
          )}

          {/* Unsupported File Type */}
          {!isPDF && !isImage && !isText && !isDocument && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                p: 2,
                textAlign: 'center',
              }}
            >
              <ErrorOutline sx={{ fontSize: 48, color: colors.textSecondary }} />
              <Typography variant="h6" color="textSecondary">
                {t('file.previewNotAvailable')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('file.unsupportedFileType')}
                <br />
                You can still download it using the download button.
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                p: 2,
                textAlign: 'center',
              }}
            >
              <ErrorOutline sx={{ fontSize: 48, color: colors.error }} />
              <Typography variant="h6" color="error">
                {t('file.previewError')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {error}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Selected Text Display */}
        {selectedText && (
          <Box
            sx={{
              p: 1,
              bgcolor: colors.surface,
              borderTop: `1px solid ${colors.border}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              {t('file.selectedText')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {selectedText}
            </Typography>
          </Box>
        )}
      </Paper>
    </Slide>
  );
};

// Component to handle text file preview
const TextFilePreview = ({ fileData, fileName, onLoad, onError, colors }) => {
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTextContent = async () => {
      try {
        if (fileData.startsWith('data:text/plain;base64,')) {
          // Handle base64 encoded text
          const base64Content = fileData.split(',')[1];
          const decodedContent = atob(base64Content);
          setTextContent(decodedContent);
        } else {
          // Handle blob URL or direct text
          const response = await fetch(fileData);
          const text = await response.text();
          setTextContent(text);
        }
        setLoading(false);
        onLoad();
      } catch (error) {
        console.error('Error loading text file:', error);
        onError('Failed to load text file content');
        setLoading(false);
      }
    };

    if (fileData) {
      loadTextContent();
    }
  }, [fileData, onLoad, onError]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        p: 2,
        bgcolor: colors.background,
        borderRadius: 1,
        border: `1px solid ${colors.border}`,
      }}
    >
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          color: colors.text,
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        }}
      >
        {textContent}
      </pre>
    </Box>
  );
};

export default FilePreview;