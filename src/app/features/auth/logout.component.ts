import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="logout-viewport">
      <div class="logout-content">
        <mat-spinner diameter="60"></mat-spinner>
        <h2 class="logout-title">Thanks for using Construction Specification System.</h2>
        <h6 class="logout-subtitle">redirecting to login page with in {{ countdown }} seconds</h6>
      </div>
    </div>
  `,
  styles: [`
    .logout-viewport {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .logout-content {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      width: 100%;
      max-width: 600px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      text-align: center;
    }

    .logout-title {
      color: #333;
      margin: 0;
      font-size: 1.8em;
      font-weight: 600;
    }

    .logout-subtitle {
      color: #666;
      margin: 0;
      font-style: italic;
      font-size: 1em;
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class LogoutComponent implements OnInit {
  countdown: number = 3;
  private changeDetectorRef = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private router = inject(Router);

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    // Run the interval inside Angular's zone so change detection works
    this.ngZone.runOutsideAngular(() => {
      const interval = setInterval(() => {
        this.countdown--;
        
        // Trigger change detection to update the template
        this.ngZone.run(() => {
          this.changeDetectorRef.markForCheck();
        });
        
        console.log(`[Logout] Countdown: ${this.countdown}`);
        
        if (this.countdown <= 0) {
          clearInterval(interval);
          // Auto-redirect to login page after countdown completes
          this.ngZone.run(() => {
            this.goToLogin();
          });
        }
      }, 1000);
    });
  }

  goToLogin(): void {
    console.log('[Logout] Redirecting to login...');
    this.router.navigate(['/login']);
  }
}
