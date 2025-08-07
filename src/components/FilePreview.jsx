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
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  ContentCopy,
  Close,
  ChevronLeft,
  ChevronRight,
  ErrorOutline,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreview = ({ open, onClose, file }) => {
  const theme = useTheme();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset state and load file when the preview is opened or the file changes
  useEffect(() => {
    if (open && file) {
      setPageNumber(1);
      setScale(1.0);
      setRotation(0);
      setSelectedText('');
      setLoading(true);
      setError(null);
    }
  }, [open, file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading document:', error);
    setError('Failed to load document. The file may be corrupted or unsupported.');
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation((prevRotation) => (prevRotation - 90 + 360) % 360); // Ensures positive rotation
  };

  const handleRotateRight = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const handleCopyText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText).catch((err) => {
        console.error('Failed to copy text:', err);
      });
    }
  };

  const isImage = file?.type?.startsWith('image/');
  const fileData = file?.data;

  // Render a generic error message if file is not provided
  if (!file) {
    return (
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Paper elevation={4} sx={{ position: 'fixed', top: 0, right: 0, width: '50%', height: '100vh', zIndex: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.paper }}>
          <ErrorOutline sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
          <Typography variant="body2" color="error">
            No file selected for preview.
          </Typography>
          <IconButton onClick={onClose} sx={{ mt: 2 }}><Close /></IconButton>
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
          width: '50%',
          height: '100vh',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file?.name || 'File Preview'}
          </Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>

        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderBottom: `1px solid ${theme.palette.divider}`, gap: 1 }}>
          <Tooltip title="Zoom In"><IconButton onClick={handleZoomIn} size="small"><ZoomIn /></IconButton></Tooltip>
          <Tooltip title="Zoom Out"><IconButton onClick={handleZoomOut} size="small"><ZoomOut /></IconButton></Tooltip>
          <Tooltip title="Rotate Left"><IconButton onClick={handleRotateLeft} size="small"><RotateLeft /></IconButton></Tooltip>
          <Tooltip title="Rotate Right"><IconButton onClick={handleRotateRight} size="small"><RotateRight /></IconButton></Tooltip>
          <Tooltip title="Copy Selected Text">
            <span>
              <IconButton onClick={handleCopyText} size="small" disabled={!selectedText || isImage}><ContentCopy /></IconButton>
            </span>
          </Tooltip>

          {numPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Tooltip title="Previous Page">
                <span>
                  <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1} size="small"><ChevronLeft /></IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {pageNumber} / {numPages}
              </Typography>
              <Tooltip title="Next Page">
                <span>
                  <IconButton onClick={goToNextPage} disabled={pageNumber >= numPages} size="small"><ChevronRight /></IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
          }}
          onMouseUp={handleTextSelection}
        >
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading preview...
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ErrorOutline sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}

          {!loading && !error && isImage && file && (
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
              }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Failed to load image. The file may be corrupted or unsupported.');
                setLoading(false);
              }}
            />
          )}

          {!loading && !error && !isImage && file && (
            <Document
              file={file.data}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
              options={{
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<CircularProgress />}
                error={<Typography color="error">Failed to load page</Typography>}
              />
            </Document>
          )}
        </Box>
      </Paper>
    </Slide>
  );
};

export default FilePreview;