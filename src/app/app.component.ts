import { Component, OnInit, ViewChild, inject, HostListener } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { ThemeService } from './core/services/theme.service';
// import { ChatDialogService } from './shared/components/chat-dialog/chat-dialog.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <header class="app-header" *ngIf="authService.isLoggedIn()">
      <mat-toolbar class="lumen-toolbar">
        <div class="brand-section">
          <img [src]="getAssetPath('lumen.svg')" alt="Lumen Logo" class="lumen-logo" />
          <div class="home-title" [routerLink]="['/home']">
            <img [src]="getAssetPath('Css_logo.png')" alt="CSS Logo" class="css-logo" />
            <span class="app-title">Construction Specification System</span>
          </div>
        </div>

        <span class="spacer"></span>

        <div class="nav-links">
          <!-- Dark / Light mode toggle 
          <button
            mat-icon-button
            class="theme-toggle-btn"
            [matTooltip]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            (click)="themeService.toggleTheme()"
            aria-label="Toggle theme"
          >
            <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>-->

          <!--<button mat-button routerLink="/projects" class="action-btn">
            <mat-icon>folder_open</mat-icon>
            <span>Projects</span>
          </button>-->

          <div class="user-header-section">
            <span class="greeting-display">
              Hi, {{ getTimeGreeting() }}
              <span class="user-name">{{ authService.currentUser()?.givenName || 'User' }} !</span>
            </span>
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-avatar-btn">
              <span class="btn-cuid">{{ authService.getCuid() }}</span>
              <img [src]="getAssetPath('user-menu.png')" alt="User Avatar" class="user-avatar" />
            </button>
          </div>

          <mat-menu #userMenu="matMenu" xPosition="before">
            <button mat-menu-item (click)="navigateToAdmin()" *ngIf="authService.currentUser()?.dataAdmin || authService.currentUser()?.userAdmin">
              <mat-icon>settings</mat-icon>
              <span>Administration</span>
            </button>
            
            <button mat-menu-item (click)="handleLogout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <div class="orange-accent-bar"></div>
    </header>

    <main [ngClass]="{ 'with-header': authService.isLoggedIn() }">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* When user is logged in, account for the fixed header */
    main.with-header {
      margin-top: 58px;
      height: calc(100vh - 58px);
      overflow-y: auto;
    }

    /* When user is not logged in, use full viewport */
    main:not(.with-header) {
      margin-top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .app-header {
      background: var(--color-bg-header-wrap, #f9e4d2);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 900;
      width: 100%;
      transition: background 300ms ease;
    }

    /* Ensure overlay menus/dialogs/backdrops are always above header */
    :host ::ng-deep .cdk-overlay-container,
    :host ::ng-deep .cdk-global-overlay-wrapper {
      z-index: 1200 !important;
    }

    .lumen-toolbar {
      background: #ffffff;
      height: 58px;
      display: flex;
      align-items: center;
      padding: 0 24px;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .lumen-logo {
      height: 32px;
      width: auto;
    }

    .home-title {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: opacity 0.3s ease;
      border-radius: 4px;
      padding: 4px 8px;
    }

    .home-title:hover {
      opacity: 0.8;
    }

    .css-logo {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .app-title {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #8a4d00; 
      letter-spacing: -0.2px;
      transition: color 300ms ease;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-btn {
      color: var(--color-text-link, #005a8c);
      font-weight: 500;
      font-size: 15px;
      height: 48px;
      transition: color 300ms ease;
    }

    .user-greeting-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      height: auto;
      border-radius: 24px;
      background: rgba(255, 152, 0, 0.05);
      transition: all 300ms ease;
    }

    .user-greeting-btn:hover {
      background: rgba(255, 152, 0, 0.12);
    }

    .user-header-section {
      display: flex;
      align-items: center;
      /* gap: 16px; */
    }

    .greeting-display {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
      font-size: 13px;
      color: #ff9800;
      font-weight: 500;
      padding: 8px 8px;
      border-radius: 4px;
      background: transparent;
      cursor: default;
    }

    .user-avatar-btn {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 8px !important;
      padding: 8px 12px !important;
      min-width: fit-content !important;
      width: auto !important;
      height: 48px !important;
      border-radius: 24px !important;
      background: rgba(255, 152, 0, 0.1) !important;
      transition: all 300ms ease !important;
      border: none !important;
      white-space: nowrap !important;
    }

    .user-avatar-btn:hover {
      background: rgba(255, 152, 0, 0.2) !important;
    }

    ::ng-deep .mat-mdc-button-base.user-avatar-btn {
      display: inline-flex !important;
      flex-direction: row !important;
    }

    ::ng-deep .user-avatar-btn .mdc-button__label {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
    }

    .btn-cuid {
      font-size: 12px;
      font-weight: 600;
      color: #8a4d00;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      margin: 0;
      flex-shrink: 0;
    }

    .greeting-text {
      display: flex;
      flex-direction: row;
      gap: 4px;
      align-items: center;
      font-size: 13px;
      color: #ff9800;
      font-weight: 500;
    }

    .user-name {
      font-weight: 600;
      color: #8a4d00;
      font-size: 14px;
    }


    .theme-toggle-btn {
      color: var(--color-text-link, #005a8c);
      transition: color 300ms ease, transform 300ms ease;
    }

    .theme-toggle-btn:hover {
      transform: rotate(20deg);
    }

    .action-btn mat-icon:not(.dropdown-icon) {
      margin-right: 6px;
    }

    .dropdown-icon {
      margin-left: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* The decorative orange bar at the bottom of the header */
    /* Material Menu Overrides to match the clean look */
    ::ng-deep .mat-mdc-menu-panel {
      border-radius: 8px !important;
      margin-top: 8px !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
      overflow: hidden !important;
    }

    /* Menu container */
    ::ng-deep .mat-mdc-menu-content {
      padding: 4px 0 !important;
    }

    /* Menu items styling */
    ::ng-deep .mat-mdc-menu-item {
      color: #333333 !important;
      font-weight: 500;
      font-size: 14px;
      height: 48px;
      transition: all 200ms ease !important;
      border-radius: 0 !important;
    }

    /* Menu item icons */
    ::ng-deep .mat-mdc-menu-item mat-icon {
      color: #ff9800 !important;
      margin-right: 12px;
      transition: color 200ms ease !important;
    }

    /* Menu item text */
    ::ng-deep .mat-mdc-menu-item span {
      color: #333333 !important;
      transition: color 200ms ease !important;
    }

    /* Menu item hover state */
    ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(255, 152, 0, 0.08) !important;
    }

    ::ng-deep .mat-mdc-menu-item:hover mat-icon {
      color: #ff7043 !important;
    }

    ::ng-deep .mat-mdc-menu-item:hover span {
      color: #ff7043 !important;
    }

    /* Menu item focus/selected state - remove default blue highlight */
    ::ng-deep .mat-mdc-menu-item:focus {
      background: rgba(255, 152, 0, 0.12) !important;
    }

    ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted {
      background: rgba(255, 152, 0, 0.15) !important;
    }

    ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted mat-icon {
      color: #ff7043 !important;
    }

    ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted span {
      color: #ff7043 !important;
    }

    /* Divider styling */
    ::ng-deep .mat-divider {
      background-color: rgba(0,0,0,0.12) !important;
      margin: 4px 0 !important;
    }

    /* Dark mode support */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-panel {
      background: #262626 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item span {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item mat-icon {
      color: #ff9800 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item:hover {
      background: rgba(255, 152, 0, 0.2) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item:hover mat-icon {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item:hover span {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted {
      background: rgba(255, 152, 0, 0.25) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted mat-icon {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-menu-item.mat-mdc-menu-item-highlighted span {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-divider {
      background-color: rgba(255,255,255,0.12) !important;
    }

    /* Keyboard arrow navigation: NO border — mimics mouse hover instead */
    :host ::ng-deep .keyboard-nav-focus {
      outline: none !important;
      box-shadow: 0 10px 24px rgba(255, 152, 0, 0.14) !important;
      transform: translateY(-2px) scale(1.03) !important;
    }

    /* Landing page nav-item buttons: orange text on keyboard focus (matches :hover) */
    :host ::ng-deep .nav-item.keyboard-nav-focus,
    :host ::ng-deep .nav-item.keyboard-nav-focus mat-icon {
      color: #ff9800 !important;
    }
    :host ::ng-deep .landing-header .nav-item.keyboard-nav-focus {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
    }
    :host ::ng-deep .landing-header .nav-item.keyboard-nav-focus span,
    :host ::ng-deep .landing-header .nav-item.keyboard-nav-focus mat-icon,
    :host ::ng-deep .landing-header button.nav-item.keyboard-nav-focus,
    :host ::ng-deep .landing-header button.nav-item.keyboard-nav-focus mat-icon {
      color: #ff9800 !important;
    }

    /* Work Items action buttons (Add/Edit/Delete/WI Notes): match landing keyboard style */
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
    }
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus span,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus mat-icon,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-activated span,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-activated mat-icon,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-activated {
      color: #ff9800 !important;
      background: transparent !important;
      box-shadow: none !important;
      transform: none !important;
      border: none !important;
      outline: none !important;
    }
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-activated .mat-mdc-button-persistent-ripple::before,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-activated .mat-mdc-focus-indicator::before,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus .mat-mdc-button-persistent-ripple::before,
    :host ::ng-deep .page-header .header-left button.nav-item.keyboard-nav-focus .mat-mdc-focus-indicator::before {
      background-color: transparent !important;
      opacity: 0 !important;
      border: none !important;
    }

    /* Back-link button (Reports/Admin): keyboard focus matches hover exactly */
    :host ::ng-deep button.back-link.keyboard-nav-focus {
      background-color: #f0f4f8 !important;
      color: #ff9800 !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
      --mat-text-button-hover-state-layer-opacity: 0 !important;
      --mat-text-button-focus-state-layer-opacity: 0 !important;
      --mat-text-button-pressed-state-layer-opacity: 0 !important;
    }
    :host ::ng-deep button.back-link.keyboard-nav-focus mat-icon,
    :host ::ng-deep .secondary-nav-header button.back-link.keyboard-nav-focus mat-icon,
    :host ::ng-deep .secondary-nav-header button.back-link.keyboard-nav-focus span,
    :host ::ng-deep .secondary-nav-header button.back-link.keyboard-nav-focus {
      color: #ff9800 !important;
    }
    :host ::ng-deep button.back-link.keyboard-nav-focus .mat-mdc-button-persistent-ripple::before,
    :host ::ng-deep button.back-link.keyboard-nav-focus .mat-mdc-focus-indicator::before {
      background-color: transparent !important;
      opacity: 0 !important;
      border: none !important;
    }

    /* Back-link button: enter/click activation matches :active state (darker orange + inset shadow) */
    :host ::ng-deep button.back-link.keyboard-activated {
      background-color: rgba(255, 152, 0, 0.14) !important;
      color: #e65100 !important;
      transform: scale(0.93) !important;
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
    }
    :host ::ng-deep button.back-link.keyboard-activated mat-icon,
    :host ::ng-deep .secondary-nav-header button.back-link.keyboard-activated mat-icon {
      color: #ff9800 !important;
    }
    :host ::ng-deep button.back-link.keyboard-activated .mat-mdc-button-persistent-ripple::before,
    :host ::ng-deep button.back-link.keyboard-activated .mat-mdc-focus-indicator::before {
      background-color: transparent !important;
      opacity: 0 !important;
      border: none !important;
    }

    /* Work Items back-button: keyboard focus matches mouse hover exactly */
    :host ::ng-deep button.back-button.keyboard-nav-focus {
      background-color: #f0f4f8 !important;
      color: #ff9800 !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
      --mat-text-button-hover-state-layer-opacity: 0 !important;
      --mat-text-button-focus-state-layer-opacity: 0 !important;
      --mat-text-button-pressed-state-layer-opacity: 0 !important;
    }
    :host ::ng-deep button.back-button.keyboard-nav-focus mat-icon {
      color: #ff9800 !important;
    }
    :host ::ng-deep button.back-button.keyboard-nav-focus span {
      color: #ff9800 !important;
    }
    :host ::ng-deep button.back-button.keyboard-nav-focus .mat-mdc-button-persistent-ripple::before,
    :host ::ng-deep button.back-button.keyboard-nav-focus .mat-mdc-focus-indicator::before {
      background-color: transparent !important;
      opacity: 0 !important;
      border: none !important;
    }

    /* Work Items back-button: Enter/Backspace activation matches mouse :active exactly */
    :host ::ng-deep button.back-button.keyboard-activated {
      background-color: #fff3e0 !important;
      color: #ff9800 !important;
      box-shadow: 0 0 0 1.5px #ff9800 !important;
      transform: none !important;
      border: none !important;
    }
    :host ::ng-deep button.back-button.keyboard-activated mat-icon {
      color: #ff9800 !important;
    }

    /* Admin / Report tiles: hover style (orange border-color + shadow + lift) */
    :host ::ng-deep .admin-tile.keyboard-nav-focus,
    :host ::ng-deep .report-tile.keyboard-nav-focus {
      outline: none !important;
      border-color: #ff9800 !important;
      background: rgba(255, 152, 0, 0.03) !important;
      box-shadow: 0 10px 24px rgba(255, 152, 0, 0.14) !important;
      transform: translateY(-2px) scale(1.03) !important;
    }

    /* Enter key click effect: mimics mouse :active press (inset shadow + scale down) */
    :host ::ng-deep .keyboard-activated {
      background: rgba(255, 152, 0, 0.16) !important;
      box-shadow: inset 0 4px 12px rgba(15, 23, 42, 0.22) !important;
      transform: translateY(1px) scale(0.94) !important;
      border-color: #e65100 !important;
      transition: all 120ms ease !important;
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('userMenu') userMenu: any;
  @ViewChild(MatMenuTrigger) userMenuTrigger!: MatMenuTrigger;

  private router = inject(Router);
  private msalService = inject(MsalService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  // private chatDialogService = inject(ChatDialogService);
  private dialog = inject(MatDialog);

  /**
   * Get greeting based on current time of day
   */
  getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  /**
   * Get asset path based on environment (local vs Rancher)
   * Local: assets/filename
   * Rancher: /assets/filename
   */
  getAssetPath(assetName: string): string {
    // Check if running on localhost (local development)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // If local, use assets/ prefix; if deployed, use /assets/ prefix
    const path = isLocalhost ? `assets/${assetName}` : `/assets/${assetName}`;
    console.log(`[AssetPath] ${assetName} → ${path} (localhost: ${isLocalhost})`);
    return path;
  }

  ngOnInit(): void {
    // Update favicon based on environment
    this.updateFaviconPath();

    // Check if user is already authenticated from SSO redirect
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      console.log('[AppInit] SSO account found, checking auth state...');
      
      // If user is on login page but has SSO account, redirect to home
      if (this.router.url === '/login' && this.authService.isLoggedIn()) {
        console.log('[AppInit] User logged in but on login page, redirecting to home');
        this.router.navigate(['/home']);
      }
    }
  }

  /**
   * Update favicon path based on environment
   */
  private updateFaviconPath(): void {
    const faviconLink = document.getElementById('favicon-link') as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = this.getAssetPath('favicon.png');
      console.log('[Favicon] Updated to:', faviconLink.href);
    }
  }

  navigateToAdmin(): void {
    this.userMenuTrigger.closeMenu();
    // Pass current project context if available
    const navState = history.state as { projectNum?: string; project?: any };
    this.router.navigate(['/admin'], {
      state: { 
        projectNum: navState?.projectNum || '',
        project: navState?.project || null
      }
    });
  }

  /**
   * Open AI Chat Assistant
   */
  openAiAssistant(): void {
    this.userMenuTrigger.closeMenu();
    // this.chatDialogService.openChatDialog({
    //   width: '500px',
    //   maxHeight: '90vh'
    // });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    // Esc should close the topmost dialog from anywhere, including inside inputs.
    if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'Escape') {
      const openDialogs = this.dialog?.openDialogs;
      if (openDialogs && openDialogs.length > 0) {
        event.preventDefault();
        openDialogs[openDialogs.length - 1].close({ action: 'cancel' });
        return;
      }
    }

    if (this.isTypingContext(event.target)) {
      return;
    }

    // Let open Material menus/dialogs consume keyboard naturally.
    if (this.isOverlayMenuOpen() && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter')) {
      return;
    }

    // Global arrow navigation for action buttons across pages.
    if (this.handleGlobalArrowNavigation(event)) {
      return;
    }

    // Alt+P opens the profile dropdown quickly.
    if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      if (this.authService.isLoggedIn()) {
        if (this.userMenuTrigger?.menuOpen) {
          this.userMenuTrigger.closeMenu();
        } else {
          this.userMenuTrigger?.openMenu();
        }
      }
      return;
    }

    // Backspace: close the topmost open dialog first; otherwise navigate back.
    if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'Backspace') {
      event.preventDefault();
      const openDialogs = this.dialog?.openDialogs;
      if (openDialogs && openDialogs.length > 0) {
        openDialogs[openDialogs.length - 1].close({ action: 'cancel' });
        return;
      }
      this.triggerBackActionWithVisualFeedback();
      return;
    }

    // Enter activates the currently keyboard-focused action with visual click feedback.
    if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.key === 'Enter') {
      const focused = document.activeElement as HTMLElement | null;
      if (focused && focused.classList.contains('keyboard-nav-focus')) {
        event.preventDefault();
        this.activateElementWithKeyboardEffect(focused);
      }
    }
  }

  private isOverlayMenuOpen(): boolean {
    return !!document.querySelector('.mat-mdc-menu-panel') || !!document.querySelector('.cdk-overlay-pane .mat-mdc-dialog-container');
  }

  private handleGlobalArrowNavigation(event: KeyboardEvent): boolean {
    const key = event.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') {
      return false;
    }

    const buttons = this.getVisibleActionButtons();
    if (!buttons.length) {
      return false;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = buttons.findIndex(btn => btn === activeElement);

    let targetIndex: number;

    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Left/Right: cycle through items sequentially
      if (currentIndex < 0) {
        targetIndex = key === 'ArrowLeft' ? buttons.length - 1 : 0;
      } else {
        const delta = key === 'ArrowRight' ? 1 : -1;
        targetIndex = (currentIndex + delta + buttons.length) % buttons.length;
      }
    } else {
      // Up/Down: grid row-aware navigation (same column, adjacent row)
      if (currentIndex < 0) {
        targetIndex = key === 'ArrowDown' ? 0 : buttons.length - 1;
      } else {
        const rects = buttons.map(b => b.getBoundingClientRect());
        const curTop = Math.round(rects[currentIndex].top);

        // Determine position of current element within its row (column index)
        const sameRow = buttons
          .map((b, i) => ({ i, rect: rects[i] }))
          .filter(x => Math.abs(Math.round(x.rect.top) - curTop) < 10)
          .sort((a, b) => a.rect.left - b.rect.left);
        const posInRow = sameRow.findIndex(x => x.i === currentIndex);

        if (key === 'ArrowDown') {
          const below = buttons
            .map((b, i) => ({ i, rect: rects[i] }))
            .filter(x => Math.round(x.rect.top) > curTop + 10)
            .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
          if (!below.length) {
            targetIndex = currentIndex;
          } else {
            const nextTop = Math.round(below[0].rect.top);
            const nextRow = below
              .filter(x => Math.abs(Math.round(x.rect.top) - nextTop) < 10)
              .sort((a, b) => a.rect.left - b.rect.left);
            targetIndex = nextRow[Math.min(posInRow, nextRow.length - 1)].i;
          }
        } else {
          const above = buttons
            .map((b, i) => ({ i, rect: rects[i] }))
            .filter(x => Math.round(x.rect.top) < curTop - 10)
            .sort((a, b) => b.rect.top - a.rect.top || a.rect.left - b.rect.left);
          if (!above.length) {
            targetIndex = currentIndex;
          } else {
            const prevTop = Math.round(above[0].rect.top);
            const prevRow = above
              .filter(x => Math.abs(Math.round(x.rect.top) - prevTop) < 10)
              .sort((a, b) => a.rect.left - b.rect.left);
            targetIndex = prevRow[Math.min(posInRow, prevRow.length - 1)].i;
          }
        }
      }
    }

    event.preventDefault();
    buttons.forEach(btn => btn.classList.remove('keyboard-nav-focus'));
    const target = buttons[targetIndex];
    target.classList.add('keyboard-nav-focus');
    target.focus();
    return true;
  }

  private getVisibleActionButtons(): HTMLElement[] {
    const selectors = [
      '.landing-header .header-navigation button.nav-item:not([disabled])',
      '.landing-header .header-navigation button.back-btn:not([disabled])',
      '.secondary-nav-header button.nav-item:not([disabled])',
      '.secondary-nav-header button.back-btn:not([disabled])',
      '.secondary-nav-header button.back-link:not([disabled])',
      '.secondary-nav-header button.back-button:not([disabled])',
      '.page-header button.nav-item:not([disabled])',
      '.page-header button.back-btn:not([disabled])',
      '.page-header button.back-link:not([disabled])',
      '.page-header button.back-button:not([disabled])',
      '.footer-right-actions button.footer-button:not([disabled])',
      '.tile-grid .admin-tile',
      '.tile-grid .report-tile'
    ];

    const all = selectors.flatMap(sel => Array.from(document.querySelectorAll<HTMLElement>(sel)));
    const visible = all.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });

    // Ensure non-native interactive tiles are focusable for arrow navigation.
    visible.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag !== 'button' && tag !== 'a' && !el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });

    return visible;
  }

  private triggerBackActionWithVisualFeedback(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const backBtn = document.querySelector<HTMLElement>('button.back-button:not([disabled]), button.back-link:not([disabled]), button.back-btn:not([disabled])');
    if (backBtn) {
      this.activateElementWithKeyboardEffect(backBtn);
      return;
    }

    this.navigateBackToProjectLanding();
  }

  private navigateBackToProjectLanding(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    if (this.router.url === '/home') {
      return;
    }

    const navState = history.state as { projectNum?: string; project?: any };
    this.router.navigate(['/home'], {
      state: {
        projectNum: navState?.projectNum || '',
        project: navState?.project || null
      }
    });
  }

  private isTypingContext(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) {
      return false;
    }
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  private activateElementWithKeyboardEffect(el: HTMLElement): void {
    el.classList.add('keyboard-activated', 'keyboard-nav-focus');
    el.focus();
    setTimeout(() => {
      el.click();
      el.classList.remove('keyboard-activated');
    }, 70);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.userMenuTrigger?.menuOpen) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const insideMenuPanel = !!target.closest('.mat-mdc-menu-panel');
    const insideMenuTrigger = !!target.closest('.user-avatar-btn');
    if (!insideMenuPanel && !insideMenuTrigger) {
      this.userMenuTrigger.closeMenu();
    }
  }

  handleLogout(): void {
    this.userMenuTrigger.closeMenu();
    this.authService.logout();
  }
}