import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'css-app-theme';

  readonly theme = signal<ThemeMode>(this.loadSavedTheme());

  constructor() {
    // Whenever the signal changes, apply the class to <html> and persist
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private applyTheme(mode: ThemeMode): void {
    const html = document.documentElement;
    html.setAttribute('data-theme', mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  private loadSavedTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Respect OS preference on first visit
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
