/**
 * Shared Utilities Barrel Export
 * Centralized imports for all utility services and constants
 * 
 * Usage in components:
 * import { THEME_COLORS, DialogService, SnackBarService } from '@shared/utilities';
 */

// Constants
export * from './constants';
export { THEME_COLORS, CSS_VARIABLES } from './theme-colors';

// Services
export { DialogService } from './dialog.service';
export { SnackBarService } from './snack-bar.service';
export { FormBuilderService } from './form-builder.service';
export { NavigationService } from './navigation.service';

// Utilities
export * from './signal-state';
