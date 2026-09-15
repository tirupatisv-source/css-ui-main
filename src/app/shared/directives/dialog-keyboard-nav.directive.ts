import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

/**
 * Dialog Keyboard Navigation Directive
 * Enables arrow key navigation between focusable elements in dialogs
 * - Right/Down arrows: move to next focusable element (or close button)
 * - Left/Up arrows: move to previous focusable element
 * - Enter: activate focused element
 * - Escape: close dialog
 */
@Directive({
  selector: '[appDialogKeyboardNav]',
  standalone: true
})
export class DialogKeyboardNavDirective implements OnInit {
  private focusableSelectors = [
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'button:not([disabled])',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])'
  ];

  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = -1;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Get the dialog container
    const dialogContainer = this.elementRef.nativeElement.closest('mat-dialog-container') ||
                           this.elementRef.nativeElement.closest('[role="dialog"]') ||
                           this.elementRef.nativeElement;
    
    this.updateFocusableElements(dialogContainer);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const dialogContainer = this.elementRef.nativeElement.closest('mat-dialog-container') ||
                           this.elementRef.nativeElement.closest('[role="dialog"]') ||
                           this.elementRef.nativeElement;

    // Update focusable elements in case DOM changed
    this.updateFocusableElements(dialogContainer);

    const activeElement = document.activeElement as HTMLElement;

    switch (event.key?.toLowerCase()) {
      case 'arrowright':
      case 'arrowdown':
        event.preventDefault();
        this.focusNext(activeElement);
        break;

      case 'arrowleft':
      case 'arrowup':
        event.preventDefault();
        this.focusPrevious(activeElement);
        break;

      case 'enter':
        // Only handle Enter if we're on a button or close button
        if (activeElement?.tagName === 'BUTTON' || activeElement?.getAttribute('role') === 'button') {
          event.preventDefault();
          (activeElement as HTMLButtonElement).click?.();
        }
        break;

      case 'escape':
        // Let Material handle Escape (closes dialog)
        break;
    }
  }

  private updateFocusableElements(container: HTMLElement): void {
    if (!container) return;

    const focusableElementsQueryString = this.focusableSelectors.join(', ');
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(focusableElementsQueryString)
    ).filter(el => {
      // Filter out hidden elements
      return el.offsetParent !== null && 
             window.getComputedStyle(el).visibility !== 'hidden' &&
             window.getComputedStyle(el).display !== 'none';
    });

    this.focusableElements = focusable;
  }

  private focusNext(currentElement: HTMLElement): void {
    const currentIndex = this.focusableElements.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % this.focusableElements.length;
    
    if (this.focusableElements[nextIndex]) {
      this.focusableElements[nextIndex].focus();
      this.addKeyboardFocusStyle(this.focusableElements[nextIndex]);
    }
  }

  private focusPrevious(currentElement: HTMLElement): void {
    const currentIndex = this.focusableElements.indexOf(currentElement);
    const prevIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
    
    if (this.focusableElements[prevIndex]) {
      this.focusableElements[prevIndex].focus();
      this.addKeyboardFocusStyle(this.focusableElements[prevIndex]);
    }
  }

  private addKeyboardFocusStyle(element: HTMLElement): void {
    // Remove previous focus styles
    this.focusableElements.forEach(el => {
      el.classList.remove('keyboard-nav-focus');
    });

    // Add focus style to new element
    element.classList.add('keyboard-nav-focus');
  }
}
