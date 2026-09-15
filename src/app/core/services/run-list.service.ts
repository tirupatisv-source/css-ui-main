import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RunListEntry } from '../models/models';
import { environment } from '../../../environments/environment';

/**
 * Run list service.
 * Converted from VB6: frmRunList, frmRunListWizard
 */
@Injectable({ providedIn: 'root' })
export class RunListService {

  constructor(private http: HttpClient) {}

  private baseUrl(projectNum: string): string {
    return `${environment.apiUrl}/api/projects/${projectNum}/run-list`;
  }

  getRunList(projectNum: string): Observable<RunListEntry[]> {
    return this.http.get<RunListEntry[]>(this.baseUrl(projectNum));
  }

  createEntry(projectNum: string, entry: Partial<RunListEntry>): Observable<RunListEntry> {
    return this.http.post<RunListEntry>(this.baseUrl(projectNum), entry);
  }

  updateEntry(projectNum: string, entry: RunListEntry): Observable<RunListEntry> {
    return this.http.put<RunListEntry>(`${this.baseUrl(projectNum)}/${entry.runId}`, entry);
  }

  deleteEntry(projectNum: string, runId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(projectNum)}/${runId}`);
  }

  copyEntry(projectNum: string, runId: number): Observable<RunListEntry> {
    return this.http.post<RunListEntry>(`${this.baseUrl(projectNum)}/${runId}/copy`, null);
  }

  reorder(projectNum: string, runId1: number, runId2: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl(projectNum)}/reorder`, { runId1, runId2 });
  }

  downloadRunList(projectNum: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl(projectNum)}/download`, { responseType: 'blob' });
  }

  uploadRunList(projectNum: string, file: File): Observable<{ message: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; path: string }>(
      `${this.baseUrl(projectNum)}/upload`, formData
    );
  }
}
