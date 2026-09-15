import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TOCViewData, DISViewData, ProjectContact, InventoryDateViewData, TitlePageViewData } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {

  constructor(private http: HttpClient) { }

  /**
   * Get Table of Contents view data for a project
   */
  getTOCData(projectNum: string): Observable<TOCViewData> {
    return this.http.get<TOCViewData>(
      `${environment.apiUrl}/api/projects/${projectNum}/report-data/toc`
    );
  }

  /**
   * Get Drawing Information Sheet view data for a project
   */
  getDISData(projectNum: string): Observable<DISViewData> {
    return this.http.get<DISViewData>(
      `${environment.apiUrl}/api/projects/${projectNum}/report-data/dis`
    );
  }

  /**
   * Get Contact List data for a project (VB6: rptContactLst / ProjContact recordset)
   */
  getContactListData(projectNum: string): Observable<ProjectContact[]> {
    return this.http.get<ProjectContact[]>(
      `${environment.apiUrl}/api/projects/${projectNum}/contacts`
    );
  }

  /**
   * Get Inventory List (Date Rec'd) data for a project (VB6: rptInventoryDate)
   */
  getInventoryDateData(projectNum: string): Observable<InventoryDateViewData> {
    return this.http.get<InventoryDateViewData>(
      `${environment.apiUrl}/api/projects/${projectNum}/report-data/inventory-date`
    );
  }

  /**
   * Get Title Page data for a project (VB6: rptTitlePage)
   */
  getTitlePageData(projectNum: string): Observable<TitlePageViewData> {
    return this.http.get<TitlePageViewData>(
      `${environment.apiUrl}/api/projects/${projectNum}/report-data/title-page`
    );
  }
}
