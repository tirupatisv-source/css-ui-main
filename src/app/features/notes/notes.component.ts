import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <!-- Notes Header Section -->
    <div class="notes-page-header">
      <div class="header-left">
        <button mat-button class="back-button" (click)="backToProject()">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Project: {{currentProjectNum}}</span>
        </button>
      </div>
      <div class="header-right">
        <span class="project-notes-header">Notes</span>
      </div>
    </div>
    <div class="header-divider"></div>

    <div class="notes-container">
      <h2 class="hidden-title">Project Notes</h2>

      <div *ngIf="!editMode" class="notes-view">
        <div class="notes-content" [class.empty]="!notes">
          {{ notes || 'No notes yet. Click Edit to add notes, instructions, or reminders.' }}
        </div>
        <div class="button-container">
          <button mat-raised-button color="primary" (click)="enableEdit()">Edit</button>
        </div>
      </div>

      <div *ngIf="editMode" class="notes-edit">
        <div class="textarea-container">
          <textarea [(ngModel)]="notes" rows="8" placeholder="Enter project notes, instructions, or reminders..."></textarea>
          <button 
            mat-icon-button 
            [class.recording]="isRecording"
            [matTooltip]="isRecording ? 'Stop Recording' : 'Start Voice Recording'"
            (click)="toggleVoiceRecording()"
            class="voice-btn"
            type="button"
          >
            <mat-icon>{{ isRecording ? 'mic' : 'mic_none' }}</mat-icon>
          </button>
        </div>
        <div *ngIf="isRecording" class="recording-indicator">
          <span class="pulse"></span>
          <span class="recording-text">{{ listeningText }}</span>
        </div>
        <div class="notes-actions">
          <button mat-button (click)="cancelEdit()">Cancel</button>
          <button mat-raised-button color="primary" (click)="saveNotes()">Save</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Notes Header Section */
    .notes-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      min-height: 64px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .back-button {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }

    .back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .back-button:hover {
      background-color: #f0f4f8;
      color: #ff9800;
    }

    .back-button:hover mat-icon {
      color: #ff9800;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .project-notes-header {
      font-size: 20px;
      font-weight: 400;
      color: #8a4d00;
      margin: 0;
    }

    .header-divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 0;
    }

    .hidden-title {
      display: none;
    }
    .notes-container {
      width: 100vw;
      min-height: 100vh;
      margin: 0;
      background: #fff;
      border-radius: 0;
      box-shadow: none;
      padding: 48px 64px 64px 64px;
      box-sizing: border-box;
    }

    h2 {
      font-size: 1.7rem;
      color: #0d0d0e;
      margin-bottom: 18px;
      margin-left: 1px;
    }

    .notes-content {
      min-height: 200px;
      font-size: 1.1rem;
      color: #333;
      background: #f7f7f7;
      border-radius: 6px;
      padding: 18px 16px;
      margin-bottom: 18px;
      margin-right: 1px;
    }
    .notes-content.empty {
      color: #aaa;
    }

    .notes-edit textarea {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      min-height: 200px;
      font-size: 1.1rem;
      color: #333;
      background: #f7f7f7;
      border-radius: 6px;
      padding: 18px 16px;
      margin-bottom: 18px;
      margin-right: 1px;
      border: 1px solid #bdbdbd;
      resize: vertical;
      box-sizing: border-box;
    }

    .textarea-container {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .textarea-container textarea {
      flex: 1;
    }

    .voice-btn {
      margin-top: 8px !important;
      color: #6b7280 !important;
      transition: all 0.2s ease !important;
    }

    .voice-btn:hover {
      color: #ff9800 !important;
      background-color: rgba(255, 152, 0, 0.1) !important;
    }

    .voice-btn.recording {
      color: #ef5350 !important;
      animation: pulse-btn 0.5s ease-in-out infinite;
    }

    @keyframes pulse-btn {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .recording-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #fff3e0;
      border: 1px solid #ffb74d;
      border-radius: 4px;
      color: #e65100;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .pulse {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #ef5350;
      border-radius: 50%;
      animation: pulse 0.6s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    .recording-text {
      flex: 1;
    }

    .notes-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .button-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    /* Match project-selector dialog button colours */
    ::ng-deep button.mat-mdc-raised-button.mat-primary,
    ::ng-deep button[mat-raised-button][color="primary"] {
      background-color: #ff9800 !important;
      color: #ffffff !important;
    }
    ::ng-deep button.mat-mdc-raised-button.mat-primary:hover:not(:disabled),
    ::ng-deep button[mat-raised-button][color="primary"]:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }
    ::ng-deep button.mat-mdc-button:not(.mat-primary):not(.mat-warn):not(.back-button) {
      color: #ff9800 !important;
    }
    ::ng-deep button.mat-mdc-button:not(.mat-primary):not(.mat-warn):not(.back-button):hover:not(:disabled) {
      background-color: rgba(25, 118, 210, 0.08) !important;
    }

    /* ====== DARK MODE ====== */
    :host-context([data-theme="dark"]) .notes-page-header {
      background-color: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .back-button {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button mat-icon {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button:hover {
      background-color: #1a2a4a !important;
      color: #ffffff !important;
    }
    :host-context([data-theme="dark"]) .project-notes-header {
      color: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .header-divider {
      background-color: #2a5298 !important;
    }
    :host-context([data-theme="dark"]) .notes-container {
      background: #121212 !important;
    }
    :host-context([data-theme="dark"]) .notes-content {
      background: #1e1e1e !important;
      color: #e0e0e0 !important;
    }
    :host-context([data-theme="dark"]) .notes-content.empty {
      color: #9e9e9e !important;
    }
    :host-context([data-theme="dark"]) .notes-edit textarea {
      background: #1e1e1e !important;
      color: #e0e0e0 !important;
      border-color: #616161 !important;
    }
    :host-context([data-theme="dark"]) .voice-btn {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .voice-btn:hover {
      color: #ff9800 !important;
      background-color: rgba(255, 152, 0, 0.15) !important;
    }
    :host-context([data-theme="dark"]) .recording-indicator {
      background: #2a1a08 !important;
      border-color: #ff9800 !important;
      color: #ffb74d !important;
    }
  `]
})
export class NotesComponent implements OnInit {
  notes: string = '';
  editMode = false;
  currentProjectNum: string = '';
  isRecording = false;
  interimText = '';
  listeningText = 'Listening...';
  private recognition: any;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    // Faster processing for real-time feedback (maxAlternatives = 1 = faster)
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.interimText = '';
      this.cdr.detectChanges();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // Add final transcript to notes with proper spacing
          if (this.notes && !this.notes.endsWith(' ') && !this.notes.endsWith('\n')) {
            this.notes += ' ';
          }
          this.notes += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim text and force immediate UI update
      this.interimText = interimTranscript;
      // Force immediate change detection for instant UI update (like YouTube captions)
      this.cdr.detectChanges();
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      this.listeningText = `Error: ${event.error}`;
      this.isRecording = false;
      this.cdr.detectChanges();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.interimText = '';
      this.cdr.detectChanges();
    };
  }

  toggleVoiceRecording() {
    if (!this.recognition) {
      alert('Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.interimText = '';
      this.cdr.detectChanges();
    } else {
      try {
        this.recognition.start();
        this.listeningText = 'Listening...';
        this.interimText = '';
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }

  loadNotes() {
    this.notes = localStorage.getItem('projectNotes') || '';
  }

  saveNotes() {
    localStorage.setItem('projectNotes', this.notes);
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.interimText = '';
    }
    this.editMode = false;
    this.cdr.detectChanges();
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.interimText = '';
    }
    this.loadNotes();
    this.editMode = false;
    this.cdr.detectChanges();
  }

  exitToHome() {
    this.router.navigate(['/home'], { state: { projectNum: this.currentProjectNum } });
  }

  ngOnInit(): void {
    // Get the project number from route params
    this.route.parent?.params.subscribe(params => {
      this.currentProjectNum = params['projectNum'] || '';
    });
    
    // Fallback: check current route params
    if (!this.currentProjectNum) {
      this.route.params.subscribe(params => {
        this.currentProjectNum = params['projectNum'] || '';
      });
    }

    this.loadNotes();
  }

  backToProject(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.interimText = '';
    }
    this.router.navigate(['/home'], { state: { projectNum: this.currentProjectNum } });
  }
}