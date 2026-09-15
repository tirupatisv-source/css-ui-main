import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="login-viewport" [style.backgroundImage]="'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(' + getAssetPath('background.png') + ')'"
         [style.backgroundSize]="'cover'"
         [style.backgroundAttachment]="'fixed'"
         [style.backgroundRepeat]="'no-repeat'"
         [style.backgroundPosition]="'center center'">
      
      <div class="left-branding-strip">
        <mat-card class="login-card">
          <div class="brand-header">
            <div class="cube-grid-logo">
              <div class="pixel-cube"></div>
              <div class="shadow-wrap">
                <div class="shadow-cube"></div>
                <div class="dither-pattern"></div>
              </div>
            </div>
            <!--<p class="brand-text">Construction Specification System</p>-->
          </div>

          <button mat-flat-button class="sso-btn" (click)="onLogin()" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Log in with Single Sign-On
            }
          </button>
        </mat-card>

        <div class="lumen-logo-bottom">
          <img [src]="getAssetPath('lumen.svg')" alt="Lumen" class="lumen-svg" />
        </div>
      </div>

      <div class="right-info-container">
        <div class="glass-info-box">
          <h2 class="section-title">System Information</h2>
          <div class="scrollable-info">
            <p><strong>Instructions for First-Time Users</strong></p>
            <p>When accessing the system for the first time, users must request access using <strong>audio</strong>. Below are the steps to ensure a smooth login process:</p>
            
            <ol class="step-ol">
              <li>You must be on the corporate network or connected via VPN to access the audio.</li>
              <li>Raise a request through audio:
                <ul>
                  <li>Verify via: <a href="https://audio.level3.com/new/index.asp" target="_blank">audio ↗</a></li>
                </ul>
              </li>
            </ol>

            <div class="existing-users-footer">
              <p><strong>Existing users:</strong></p>
              <p>Once you connected to corporate network or VPN, You can log in using your lumen microsoft credentials.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Auth check loading overlay -->
      @if (authService.authCheckInProgress()) {
        <div class="auth-check-overlay">
          <mat-spinner diameter="60" strokeWidth="5"></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      margin: 0;
      padding: 0;
    }

    /* THE BASE BACKGROUND - Scoped to the entire screen */
    .login-viewport {
      height: 100%;
      width: 100%;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    /* THE LEFT WHITE STRIP - Now floating with a margin */
    .left-branding-strip {
      width: 30%; 
      height: 100%;
      /* Adjusted opacity to 0.50 (50%) to let the fiber-bg glow through */
      background: rgba(255, 255, 255, 0.50) !important;
      
      /* Essential for the "frosted" look */
      backdrop-filter: blur(10px); 
      -webkit-backdrop-filter: blur(10px);

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 5;
      margin-left: 10%; 
      box-shadow: 0 0 40px rgba(0,0,0,0.3);
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      border-right: 1px solid rgba(255, 255, 255, 0.3);
    }

/* Ensure the login card inside also looks integrated */
    .login-card {
      width: 85%;
      max-width: 320px;
      padding: 40px 20px;
      border-radius: 12px;
      /* Keeping the card slightly more solid for readability */
      background: rgba(255, 255, 255, 0.40);
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid rgba(242, 242, 242, 0.5);
    }

    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
    }

    .brand-text {
      font-size: 13px;
      color: #666;
      text-align: center;
      margin-top: 15px;
      line-height: 1.5;
    }

    .sso-btn {
      width: 100%;
      height: 48px;
      background-color: #ff9800 !important;
      color: white !important;
      font-size: 14px;
    }

    .lumen-logo-bottom {
      position: absolute;
      bottom: 40px;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .lumen-svg { height: 20px; }

    /* THE RIGHT CONTAINER */
    .right-info-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      z-index: 1;
    }

    .glass-info-box {
      background: rgba(255, 255, 255, 0.50);
      backdrop-filter: blur(10px);
      width: 100%;
      max-width: 600px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    }

    .section-title {
      font-size: 24px;
      color: #333;
      margin: 0 0 20px 0;
      border-bottom: 2px solid #0072bc;
      padding-bottom: 10px;
    }

    .scrollable-info { font-size: 14px; color: #444; line-height: 1.6; }
    .step-ol { padding-left: 20px; }
    .step-ol li { margin-bottom: 15px; }
    .step-ol a { color: #0072bc; text-decoration: none; font-weight: 500; }

    .existing-users-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    /* LOGO GRID CSS */
    .cube-grid-logo { width: 70px; height: 70px; position: relative; }
    .pixel-cube {
      width: 60px; height: 60px; background: #ffff00; position: absolute; top: 0; left: 0; z-index: 2;
      background-image: 
        repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 15px),
        repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 15px),
        radial-gradient(circle, #000 1.5px, transparent 1.5px);
      background-size: 15px 15px; background-position: -0.5px -0.5px, -0.5px -0.5px, 6px 6px;
    }
    .shadow-wrap { width: 60px; height: 60px; position: absolute; bottom: 0; right: 0; z-index: 1; }
    .shadow-cube { width: 100%; height: 100%; background: #008080; filter: brightness(0.7); }
    .dither-pattern {
      width: 10px; height: 100%; position: absolute; right: -8px; top: 10px;
      background-image: 
        linear-gradient(45deg, #008080 25%, transparent 25%), 
        linear-gradient(-45deg, #008080 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #008080 75%), 
        linear-gradient(-45deg, transparent 75%, #008080 75%);
      background-size: 6px 6px; opacity: 0.8;
    }

    @media (max-width: 1100px) {
      .left-branding-strip { margin-left: 0; width: 40%; }
    }

    @media (max-width: 900px) {
      .left-branding-strip { width: 100%; margin-left: 0; }
      .right-info-container { display: none; }
    }

    /* Auth check loading overlay */
    .auth-check-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    ::ng-deep .auth-check-overlay .mdc-circular-progress__determinate-circle {
      stroke: #ff9800 !important;
    }

    ::ng-deep .auth-check-overlay .mat-spinner circle {
      stroke: #ff9800 !important;
    }
  `]
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Update favicon based on environment
    this.updateFaviconPath();
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
    return isLocalhost ? `assets/${assetName}` : `/assets/${assetName}`;
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

  onLogin(): void {
    // Double-check: don't allow multiple concurrent login attempts
    if (this.loading()) {
      console.log('[Login] Login already in progress, ignoring click');
      return;
    }
    
    this.loading.set(true);
    console.log('[Login] Starting SSO login...');
    this.authService.login().subscribe({
      next: () => {
        console.log('[Login] SSO login successful, isLoggedIn:', this.authService.isLoggedIn());
        this.loading.set(false);
        // Add a small delay to ensure auth state is fully updated
        setTimeout(() => {
          console.log('[Login] Navigating to home...');
          this.router.navigate(['/home']).then(success => {
            if (!success) {
              console.warn('[Login] Navigation to home failed');
            }
          });
        }, 300);
      },
      error: (error) => {
        console.error('[Login] SSO login failed:', error);
        this.loading.set(false);
        
        // Check for interaction_in_progress error
        if (error?.message?.includes('interaction_in_progress')) {
          console.warn('[Login] Interaction in progress - MSAL may have stale state. Try refreshing the page.');
          // Could automatically retry after a delay, but it's safer to ask user to refresh
        }
      }
    });
  }
}