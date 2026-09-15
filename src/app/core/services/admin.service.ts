import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MasterPart, Company, MaterialCategory, EarthquakeZone,
  WorkOperationType,   RunListCategory, RunListAssociation, CableType,
  ColorDesignation, PartGroup, UserSecurity,
  ComponentPart
} from '../models/models';
import { environment } from '@env/environment';

/**
 * Admin service for reference data management.
 * Converted from VB6: frmAdmMenu and all admin sub-forms.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {

  private baseUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) { }

  // Master Parts (frmAdmPartsList)
  getParts(partGroupId?: string): Observable<MasterPart[]> {
    let params = new HttpParams();
    if (partGroupId) params = params.set('partGroupId', partGroupId);
    return this.http.get<MasterPart[]>(`${this.baseUrl}/parts`, { params });
  }
  getTotalMasterPartsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/parts/count/total`);
  }
  getMasterPartsCountByGroup(partGroupId: string): Observable<number> {
    let params = new HttpParams().set('partGroupId', partGroupId);
    return this.http.get<number>(`${this.baseUrl}/parts/count/group`, { params });
  }
  
  /**
   * Search parts by specified field
   * Fields: partNum, vendorName, partDesc, itemId, oracleItemId
   */
  searchPartsByField(field: string, searchTerm: string): Observable<any[]> {
    let params = new HttpParams()
      .set('field', field)
      .set('searchTerm', searchTerm);
    return this.http.get<any[]>(`${this.baseUrl}/parts/search`, { params });
  }

  savePart(part: Partial<MasterPart>): Observable<MasterPart> {
    return part.partId
      ? this.http.put<MasterPart>(`${this.baseUrl}/parts/${part.partId}`, part)
      : this.http.post<MasterPart>(`${this.baseUrl}/parts`, part);
  }

  deletePart(partId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parts/${partId}`);
  }

  /**
   * Update SAP Item ID for a master part (Oracle DB persistence)
   */
  updateMasterPartItemId(partId: number | string, sapItemId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/parts/${partId}/item-id`, { itemId: sapItemId });
  }

  // Component Parts / Associated Parts (frmAdmAssocPartsTable) - full table view
  getAllComponentParts(): Observable<ComponentPart[]> {
    return this.http.get<ComponentPart[]>(`${this.baseUrl}/component-parts/all`);
  }

  getTotalComponentPartsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/component-parts/count/total`);
  }

  createComponentPart(part: Partial<ComponentPart>): Observable<ComponentPart> {
    return this.http.post<ComponentPart>(`${this.baseUrl}/component-parts`, part);
  }

  updateComponentPart(compPartId: number, part: Partial<ComponentPart>): Observable<ComponentPart> {
    return this.http.put<ComponentPart>(`${this.baseUrl}/component-parts/${compPartId}`, part);
  }

  deleteComponentPart(compPartId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/component-parts/${compPartId}`);
  }

  // Companies (frmAdmCompany)
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }
  saveCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, company);
  }

  // Material Categories (frmAdmMatCategory)
  getMaterialCategories(): Observable<MaterialCategory[]> {
    return this.http.get<MaterialCategory[]>(`${this.baseUrl}/material-categories`);
  }

  // Earthquake Zones (frmAdmEQZone)
  getEarthquakeZones(): Observable<EarthquakeZone[]> {
    return this.http.get<EarthquakeZone[]>(`${this.baseUrl}/earthquake-zones`);
  }

  // Work Operations (frmAdmWorkItemOp)
  getWorkOperations(): Observable<WorkOperationType[]> {
    return this.http.get<WorkOperationType[]>(`${this.baseUrl}/work-operations`);
  }

  // Run List Categories (frmAdmRunListCat)
  getRunListCategories(): Observable<RunListCategory[]> {
    return this.http.get<RunListCategory[]>(`${this.baseUrl}/run-list-categories`);
  }

  // Cable Types (frmAdmCableType)
  getCableTypes(runlistCatId?: number): Observable<CableType[]> {
    let params = new HttpParams();
    if (runlistCatId) params = params.set('runlistCatId', runlistCatId.toString());
    return this.http.get<CableType[]>(`${this.baseUrl}/cable-types`, { params });
  }

  // Color Designations (frmAdmCableColor)
  getColorDesignations(): Observable<ColorDesignation[]> {
    return this.http.get<ColorDesignation[]>(`${this.baseUrl}/color-designations`);
  }

  // Unit of Measure (frmUOM)
  getUnitOfMeasure(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/uom`);
  }
  createUnitOfMeasure(uom: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/uom`, uom);
  }
  updateUnitOfMeasure(id: number, uom: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/uom/${id}`, uom);
  }
  deleteUnitOfMeasure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/uom/${id}`);
  }

  // Component Parts / Part Associations (frmAdmAssocParts, frmAdmAssocPartsTable)
  getComponentParts(partId: number, eqId: number): Observable<any[]> {
    let params = new HttpParams();
    params = params.set('partId', partId.toString());
    params = params.set('eqId', eqId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/component-parts`, { params });
  }

  // Run List Associations (frmAdmRunListAssoc)
  getRunListAssociations(runlistCatId?: number): Observable<RunListAssociation[]> {
    let params = new HttpParams();
    if (runlistCatId) params = params.set('runlistCatId', runlistCatId.toString());
    return this.http.get<RunListAssociation[]>(`${this.baseUrl}/run-list-associations`, { params });
  }

  // Part Groups
  getPartGroups(): Observable<PartGroup[]> {
    return this.http.get<PartGroup[]>(`${this.baseUrl}/part-groups`);
  }

  // User Management (frmUserAccAdm)
  getUsers(): Observable<UserSecurity[]> {
    return this.http.get<UserSecurity[]>(`${this.baseUrl}/users`);
  }

  getUserByUsername(username: string): Observable<UserSecurity> {
    return this.http.get<UserSecurity>(`${this.baseUrl}/users/search/username/${username}`);
  }

  getUserByCuid(cuid: string): Observable<UserSecurity> {
    return this.http.get<UserSecurity>(`${this.baseUrl}/users/search/cuid/${cuid}`);
  }

  /**
   * Search for users by username (partial match, case-insensitive)
   * @param username - Username to search for (partial match)
   * @returns Observable of matching users
   */
  searchUsersByUsername(username: string): Observable<UserSecurity[]> {
    const params = new HttpParams().set('search', username);
    return this.http.get<UserSecurity[]>(`${this.baseUrl}/users/search/username-contains`, { params });
  }

  /**
   * Search for users by CUID (case-insensitive exact match)
   * @param cuid - CUID to search for (case-insensitive)
   * @returns Observable of matching users
   */
  searchUsersByCuid(cuid: string): Observable<UserSecurity[]> {
    const params = new HttpParams().set('search', cuid);
    return this.http.get<UserSecurity[]>(`${this.baseUrl}/users/search/cuid-contains`, { params });
  }

  saveUser(user: UserSecurity): Observable<UserSecurity> {
    return this.http.post<UserSecurity>(`${this.baseUrl}/users`, user);
  }
  deleteUser(userName: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userName}`);
  }
}
