import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Project, ProjectContact } from '../models/models';
import { environment } from '../../../environments/environment';

/**
 * Project service.
 * Converted from VB6: frmDetails, frmNewProject, frmOpenProject, frmCopyProject, frmDeleteProject
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {

  private baseUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) { }

  /** Get projects with optional server-side pagination and search filtering
   * @param page - Page number (0-indexed)
   * @param size - Number of items per page (default 50)
   * @param search - Optional search term to filter by projectNum, city, state, or owner
   * @param partGroupId - Optional part group ID filter
   */
  getProjects(page: number = 0, size: number = 50, search?: string, partGroupId?: string): Observable<Project[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('pagination', 'true');
    
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (partGroupId) {
      params = params.set('partGroupId', partGroupId);
    }
    return this.http.get<Project[]>(this.baseUrl, { params });
  }

  /** Get total count of projects (for pagination purposes)
   * @param search - Optional search term filter
   */
  getProjectsCount(search?: string): Observable<{ count: number }> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<{ count: number }>(`${this.baseUrl}/count`, { params });
  }

  getProject(projectNum: string): Observable<Project> {
    const startTime = performance.now();
    console.log(`[ProjectService] 🔄 getProject() START - projectNum: "${projectNum}"`);
    
    // Fetch project and then fetch contacts for that project
    return this.http.get<Project>(`${this.baseUrl}/${projectNum}`).pipe(
      switchMap(project => 
        this.http.get<ProjectContact[]>(`${this.baseUrl}/${projectNum}/contacts`).pipe(
          map(contacts => ({
            ...project,
            contacts: contacts || []
          }))
        )
      )
    );
  }

  createProject(projectNum: string, userName: string): Observable<Project> {
    const params = new HttpParams().set('projectNum', projectNum).set('userName', userName);
    return this.http.post<Project>(this.baseUrl, null, { params });
  }

  updateProject(project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${project.projectNum}`, project);
  }

  copyProject(sourceProjectNum: string, newProjectNum: string, userName: string): Observable<Project> {
    const params = new HttpParams()
      .set('newProjectNum', newProjectNum)
      .set('userName', userName || 'unknown');
    console.log('copyProject API call:', {
      url: `${this.baseUrl}/${sourceProjectNum}/copy`,
      params: params.keys().reduce((acc, k) => ({ ...acc, [k]: params.get(k) }), {})
    });
    return this.http.post<Project>(`${this.baseUrl}/${sourceProjectNum}/copy`, null, { params });
  }

  deleteProject(projectNum: string): Observable<void> {
    console.log('deleteProject API call:', {
      url: `${this.baseUrl}/${projectNum}`
    });
    return this.http.delete<void>(`${this.baseUrl}/${projectNum}`);
  }

  /** Creates a folder under Projects\ for every project in the database. */
  syncFolders(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sync-folders`, null);
  }

  completeProject(projectNum: string): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/${projectNum}/complete`, null);
  }

  canEdit(projectNum: string, userName: string, isProjAdmin: boolean): Observable<{ canEdit: boolean }> {
    const params = new HttpParams().set('userName', userName).set('isProjAdmin', isProjAdmin.toString());
    return this.http.get<{ canEdit: boolean }>(`${this.baseUrl}/${projectNum}/can-edit`, { params });
  }
}
