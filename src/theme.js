// theme.js
import { createTheme } from "@mui/material/styles";

// Your color palette constants
const COLORS = {
  primary: "#6366F1",     
  secondary: "#f4c7a8",   
  tertiary: "#f4ccc2",    
  accent: "#000000",      
  white: "#ffffff",       
  greys: {
    light: "#f5f5f5",
    medium: "#e0e0e0",
    dark: "#9e9e9e",
    darker: "#757575",
  }
};

// Light theme configuration
export const lightTheme = createTheme({ 
  palette: {
    mode: 'light',
    greys: COLORS.greys, 
    primary: {
      main: COLORS.primary,        // #f4c28e
      light: COLORS.secondary,     // #f4c7a8  
      dark: "#e0ad78",            // Slightly darker for depth
      contrastText: COLORS.accent, // #000000
    },
    secondary: {
      main: COLORS.secondary,      // #f4c7a8
      light: COLORS.tertiary,     // #f4ccc2
      dark: "#f0b896",           // Slightly darker secondary
      contrastText: COLORS.accent, // #000000
    },
    info: {
      main: COLORS.primary,        // #f4c28e (for chips)
      light: COLORS.secondary,     // #f4c7a8 (for chip hover)
      dark: "#e0ad78",
      contrastText: COLORS.accent, // #000000
    },
    background: {
      default: COLORS.white,       // #ffffff (main app background)
      paper: COLORS.white,         // #ffffff (elevated components)
      hover: COLORS.greys.light,   // #f5f5f5 (hover states)
      accent: COLORS.tertiary,     // #f4ccc2 (accent backgrounds)
    },
    text: {
      primary: COLORS.accent,      // #000000 (main text)
      secondary: "#333333",        // Dark grey (secondary text)
      disabled: "#666666",         // Medium grey (disabled elements)
      chipText: COLORS.accent,     // #000000 (chip text)
    },
    action: {
      active: COLORS.accent,       // #000000 (active states)
      hover: COLORS.greys.light,   // #f5f5f5 (hover backgrounds)
      selected: COLORS.tertiary,   // #f4ccc2 (selected states)
      disabled: COLORS.greys.dark, // #9e9e9e (disabled)
    },
    divider: COLORS.greys.medium,  // #e0e0e0 (borders and dividers)
    
    // Custom colors for specific components
    custom: {
      sidebar: {
        background: "#1f1e1d",     // Dark sidebar background
        text: COLORS.white,        // White text in sidebar
        accent: COLORS.primary,    // Primary color for sidebar accents
      },
      chat: {
        userBubble: COLORS.greys.light,  // Light grey for user messages
        aiBubble: COLORS.white,          // White for AI messages
        aiAvatar: COLORS.primary,        // Primary color for AI avatar
        userAvatar: COLORS.greys.light,  // Light grey for user avatar
      },
      upload: {
        background: COLORS.tertiary,     // Light peach for upload area
        hover: COLORS.secondary,         // Medium peach for hover
        border: COLORS.primary,          // Primary color for borders
      }
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h2: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h3: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h4: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h5: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h6: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    body1: {
      color: COLORS.accent,
    },
    body2: {
      color: "#333333",
    },
  },
  components: {
    // Custom component styles
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: "#e0ad78",
          },
        },
        outlined: {
          borderColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: COLORS.secondary,
            borderColor: COLORS.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: COLORS.secondary,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.white,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: COLORS.primary },
    secondary: { main: COLORS.secondary },
    background: {
      default: "#181818",
      paper: "#232323",
      hover: "#232323",
      accent: "#232323",
    },
    text: {
      primary: "#fff",
      secondary: "#bdbdbd",
      disabled: "#666",
      chipText: "#fff",
    },
    action: {
      active: COLORS.accent,       // #000000 (active states)
      hover: COLORS.greys.light,   // #f5f5f5 (hover backgrounds)
      selected: COLORS.tertiary,   // #f4ccc2 (selected states)
      disabled: COLORS.greys.dark, // #9e9e9e (disabled)
    },
    divider: COLORS.greys.medium,  // #e0e0e0 (borders and dividers)
    
    // Custom colors for specific components
    custom: {
      sidebar: {
        background: "#181818",
        text: "#fff",
        accent: COLORS.primary,
      },
      chat: {
        userBubble: COLORS.greys.light,  // Light grey for user messages
        aiBubble: COLORS.white,          // White for AI messages
        aiAvatar: COLORS.primary,        // Primary color for AI avatar
        userAvatar: COLORS.greys.light,  // Light grey for user avatar
      },
      upload: {
        background: COLORS.tertiary,     // Light peach for upload area
        hover: COLORS.secondary,         // Medium peach for hover
        border: COLORS.primary,          // Primary color for borders
      }
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h2: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h3: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h4: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h5: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    h6: {
      fontWeight: 600,
      color: COLORS.accent,
    },
    body1: {
      color: COLORS.accent,
    },
    body2: {
      color: "#333333",
    },
  },
  components: {
    // Custom component styles
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: "#e0ad78",
          },
        },
        outlined: {
          borderColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: COLORS.secondary,
            borderColor: COLORS.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.primary,
          color: COLORS.accent,
          '&:hover': {
            backgroundColor: COLORS.secondary,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.white,
        },
      },
    },
  },
});


// Export colors for direct use in components if needed
export { COLORS };