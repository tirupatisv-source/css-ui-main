/**
 * Unified Color Palette
 * Used across all dialogs, forms, and components
 * Enables theming support in future
 */

export const THEME_COLORS = {
  // Primary Orange - Used for borders, labels, primary actions
  primary: {
    main: '#ff9800',
    dark: '#fb8500',
    light: 'rgba(255, 152, 0, 0.4)', // 40% opacity for placeholders
    base: 'rgba(255, 152, 0, 1)',
  },

  // Dialog Title Brown
  dialogTitle: '#8a4d00',

  // Secondary Blue - Used for warn/secondary buttons
  secondary: {
    main: '#ff9800',
    dark: '#0d47a1',
    hover: '#1565c0',
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    lightGray: '#f5f5f5',
    borderGray: '#e0e0e0',
    darkGray: 'rgba(0, 0, 0, 0.6)',
  },

  // Status Colors
  error: '#b00020',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',

  // Selection & Hover
  selectedBackground: '#f1ece5', // Light peach for selected rows
};

/**
 * Export as CSS variables for global usage
 */
export const CSS_VARIABLES = {
  '--color-primary': THEME_COLORS.primary.main,
  '--color-primary-dark': THEME_COLORS.primary.dark,
  '--color-primary-light': THEME_COLORS.primary.light,
  '--color-secondary': THEME_COLORS.secondary.main,
  '--color-secondary-dark': THEME_COLORS.secondary.dark,
  '--color-dialog-title': THEME_COLORS.dialogTitle,
  '--color-error': THEME_COLORS.error,
  '--color-selected-bg': THEME_COLORS.selectedBackground,
};
