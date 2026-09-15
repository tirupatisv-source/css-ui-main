import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkItem, ProjectPart } from '../models/models';
import { environment } from '../../../environments/environment';

/**
 * Work items service.
 * Converted from VB6: frmWorkItems, frmWorkItemWizard
 */
@Injectable({ providedIn: 'root' })
export class WorkItemService {

  constructor(private http: HttpClient) {}

  private baseUrl(projectNum: string): string {
    return `${environment.apiUrl}/api/projects/${projectNum}/work-items`;
  }

  getWorkItems(projectNum: string): Observable<WorkItem[]> {
    return this.http.get<WorkItem[]>(this.baseUrl(projectNum));
  }

  getWorkItem(projectNum: string, workItemId: number): Observable<WorkItem> {
    return this.http.get<WorkItem>(`${this.baseUrl(projectNum)}/${workItemId}`);
  }

  getProjectParts(projectNum: string, workItemId: number): Observable<ProjectPart[]> {
    return this.http.get<ProjectPart[]>(`${this.baseUrl(projectNum)}/${workItemId}/parts`);
  }

  getAssociatedParts(projectNum: string, workItemId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl(projectNum)}/${workItemId}/associated-parts`);
  }

  getLineups(projectNum: string, workItemId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl(projectNum)}/${workItemId}/lineups`);
  }

  createWorkItem(projectNum: string, workItem: Partial<WorkItem> & { parts?: Partial<ProjectPart>[] }): Observable<WorkItem> {
    return this.http.post<WorkItem>(this.baseUrl(projectNum), workItem);
  }

  updateWorkItem(projectNum: string, workItemId: number, workItem: Partial<WorkItem>): Observable<WorkItem> {
    const url = `${this.baseUrl(projectNum)}/${workItemId}`;
    console.log('API Call: PUT', url, 'with data:', workItem);
    return this.http.put<WorkItem>(url, workItem);
  }

  updateNotes(projectNum: string, workItemId: number, notes: string): Observable<{ message: string; workItemId: number }> {
    return this.http.put<{ message: string; workItemId: number }>(
      `${this.baseUrl(projectNum)}/${workItemId}/notes`,
      { notes }
    );
  }

  deleteWorkItem(projectNum: string, workItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(projectNum)}/${workItemId}`);
  }

  reorder(projectNum: string, workItemId1: number, workItemId2: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl(projectNum)}/reorder`, { workItemId1, workItemId2 });
  }

  getAllMasterParts(projectNum: string): Observable<any[]> {
    // Fetch all master parts from admin API
    return this.http.get<any[]>(`${environment.apiUrl}/api/admin/parts`);
  }

  getWorkItemMasterParts(projectNum: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl(projectNum)}/master-parts/all`);
  }

  getPartsByCategory(projectNum: string, categoryId: number): Observable<any[]> {
    // Fetch parts by material category from admin API
    const params = new HttpParams().set('categoryId', categoryId.toString());
    return this.http.get<any[]>(`${environment.apiUrl}/api/admin/parts/by-category`, { params });
  }

  savePart(projectNum: string, workItemId: number, part: Partial<ProjectPart>): Observable<ProjectPart> {
    if (part.projPartId) {
      // Update existing part
      return this.http.put<ProjectPart>(`${this.baseUrl(projectNum)}/${workItemId}/parts/${part.projPartId}`, part);
    } else {
      // Create new part
      return this.http.post<ProjectPart>(`${this.baseUrl(projectNum)}/${workItemId}/parts`, part);
    }
  }

  deletePart(projectNum: string, workItemId: number, partId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(projectNum)}/${workItemId}/parts/${partId}`);
  }

  saveAssociatedPart(
    projectNum: string,
    workItemId: number,
    payload: { projPartId: number; assocPartId: number; qty: number; catId: number }
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl(projectNum)}/${workItemId}/associated-parts`, payload);
  }

  deleteAssociatedPart(projectNum: string, workItemId: number, projPartId: number, assocPartId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(projectNum)}/${workItemId}/associated-parts/${projPartId}/${assocPartId}`);
  }

  saveLineup(projectNum: string, workItemId: number, lineup: any): Observable<any> {
    if (lineup.itemLineupId) {
      return this.http.put<any>(`${this.baseUrl(projectNum)}/${workItemId}/lineups/${lineup.itemLineupId}`, lineup);
    } else {
      return this.http.post<any>(`${this.baseUrl(projectNum)}/${workItemId}/lineups`, lineup);
    }
  }

  deleteLineup(projectNum: string, workItemId: number, lineupId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(projectNum)}/${workItemId}/lineups/${lineupId}`);
  }
}

