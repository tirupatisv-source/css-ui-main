import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { signal } from '@angular/core';

export interface AddressLookupData {
  projectNum: string;
}

export interface AddressResult {
  addressId: string;
  siteName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  logisticsLocationId?: number;
  siteId?: string;
  logisticsLocationName?: string;
  clliCd?: string;
  plant?: string;
  serviceLocationId?: string;
}

/**
 * Address lookup dialog — converted from VB6 frmAddressLookup.
 * Searches for addresses using multiple criteria fields.
 */
@Component({
  selector: 'app-address-lookup',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatTableModule,
    MatTooltipModule, MatIconModule
  ],
  template: `
    <div class="address-lookup-dialog">
      <h2 mat-dialog-title>Search For Site</h2>
      <mat-dialog-content>
        <div class="search-note">
          <p><strong>Note:</strong> You can use wildcards (%) or asterisk (*) in your search to find the text</p>
        </div>

        <div class="search-criteria">
          <h3>Search Criteria</h3>
          <div class="search-grid">
            <div class="form-field">
              <label>Address ID:</label>
              <input [(ngModel)]="addressId" placeholder="Enter Address ID..." />
            </div>
            <div class="form-field">
              <label>Site Name:</label>
              <input [(ngModel)]="siteName" placeholder="Enter Site Name..." />
            </div>
            <div class="form-field">
              <label>Address:</label>
              <input [(ngModel)]="address" placeholder="Enter Address..." />
            </div>
            <div class="form-field">
              <label>City:</label>
              <input [(ngModel)]="city" placeholder="Enter City..." />
            </div>
            <div class="form-field">
              <label>CLLI Code:</label>
              <input [(ngModel)]="clliCode" placeholder="Enter CLLI Code..." />
            </div>
            <div class="form-field">
              <label>State:</label>
              <input [(ngModel)]="state" placeholder="Enter State..." />
            </div>
            <div class="form-field">
              <label>Country:</label>
              <input [(ngModel)]="country" placeholder="Enter Country..." />
            </div>
            <div class="form-field">
              <label>Zip:</label>
              <input [(ngModel)]="zip" placeholder="Enter Zip..." />
            </div>
          </div>
          <div class="button-row">
            <button mat-raised-button color="primary" (click)="search()" [disabled]="loading()">
              {{ loading() ? 'Searching...' : 'Search' }}
            </button>
            <button mat-stroked-button (click)="clear()">Clear</button>
          </div>
        </div>

        @if (loading()) {
          <div class="spinner-wrapper"><mat-spinner diameter="32"></mat-spinner></div>
        }

        @if (hasResults()) {
          <div class="search-results">
            <h3>Search Results ({{ dataSource.data.length }} found)</h3>
            <table mat-table [dataSource]="dataSource" class="results-table">
              <ng-container matColumnDef="siteId">
                <th mat-header-cell *matHeaderCellDef>Site ID</th>
                <td mat-cell *matCellDef="let element">{{ element.siteId }}</td>
              </ng-container>
              <ng-container matColumnDef="logisticsLocationName">
                <th mat-header-cell *matHeaderCellDef>Site Name</th>
                <td mat-cell *matCellDef="let element">{{ element.logisticsLocationName }}</td>
              </ng-container>
              <ng-container matColumnDef="address">
                <th mat-header-cell *matHeaderCellDef>Address</th>
                <td mat-cell *matCellDef="let element">{{ element.address }}</td>
              </ng-container>
              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>City</th>
                <td mat-cell *matCellDef="let element">{{ element.city }}</td>
              </ng-container>
              <ng-container matColumnDef="state">
                <th mat-header-cell *matHeaderCellDef>State</th>
                <td mat-cell *matCellDef="let element">{{ element.state }}</td>
              </ng-container>
              <ng-container matColumnDef="zip">
                <th mat-header-cell *matHeaderCellDef>Zip</th>
                <td mat-cell *matCellDef="let element">{{ element.zip }}</td>
              </ng-container>
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button (click)="selectResult(element)" matTooltip="Select this address">
                    ✓
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns" style="background: #f5f5f5; font-weight: bold;"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="result-row" 
                  style="cursor: pointer; border-bottom: 1px solid #ddd; background: white;"
                  (click)="selectResult(row)"></tr>
            </table>
          </div>
        }

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./address-lookup.dialog.scss']
})
export class AddressLookupDialog {
  addressId = '';
  siteName = '';
  address = '';
  city = '';
  clliCode = '';
  state = '';
  country = '';
  zip = '';

  loading = signal(false);
  dataSource = new MatTableDataSource<AddressResult>([]);
  hasResults = signal(false);
  error = signal('');
  displayedColumns: string[] = ['siteId', 'logisticsLocationName', 'address', 'city', 'state', 'zip', 'action'];

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddressLookupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AddressLookupData
  ) {}

  search(): void {
    if (!this.isSearchCriteriaEmpty()) {
      this.loading.set(true);
      this.error.set('');
      this.hasResults.set(false);
      this.dataSource.data = [];

      const params = {
        addressId: this.addressId,
        siteName: this.siteName,
        address: this.address,
        city: this.city,
        clli: this.clliCode,
        state: this.state,
        country: this.country,
        zip: this.zip
      };

      this.http.get<any>(
        `${environment.apiUrl}/api/lookup/addresses`,
        { params }
      ).subscribe({
        next: (res) => {
          // API returns either:
          // 1. [{ logisticsLocations: [...] }] - array with wrapper object
          // 2. { logisticsLocations: [...] } - single wrapper object
          // 3. [...] - direct array of locations
          let locations: AddressResult[] = [];
          
          if (Array.isArray(res)) {
            // If it's an array, check if first element has logisticsLocations
            if (res.length > 0 && res[0]?.logisticsLocations) {
              locations = res[0].logisticsLocations;
            } else {
              locations = res;
            }
          } else if (res?.logisticsLocations) {
            // If it's an object with logisticsLocations property
            locations = res.logisticsLocations;
          }
          
          console.log('[AddressLookup] Received locations:', locations);
          locations.forEach((loc, idx) => {
            console.log(`  [${idx}] ${loc.logisticsLocationName} - ${loc.address}, ${loc.city}, ${loc.state}`);
          });
          
          this.dataSource.data = locations;
          this.hasResults.set(locations.length > 0);
          if (locations.length === 0) {
            this.error.set('No addresses found matching your criteria');
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AddressLookup] Error:', err);
          this.error.set('Error searching addresses. Please try again.');
          this.loading.set(false);
        }
      });
    } else {
      this.error.set('Please enter at least one search criterion');
    }
  }

  selectResult(result: AddressResult): void {
    // Map API response fields to the format expected by the calling component
    const mappedResult = {
      addressId: result.siteId,  // Map siteId to addressId
      siteName: result.logisticsLocationName,  // Map logisticsLocationName to siteName
      address: result.address,
      city: result.city,
      state: result.state,
      country: result.country,
      zip: result.zip,
      clliCd: result.clliCd,
      plant: result.plant,
      logisticsLocationName: result.logisticsLocationName,
      serviceLocationId: result.serviceLocationId
    };
    console.log('[AddressLookup] Returning result with plant:', mappedResult.plant);
    this.dialogRef.close(mappedResult);
  }

  clear(): void {
    this.addressId = '';
    this.siteName = '';
    this.address = '';
    this.city = '';
    this.clliCode = '';
    this.state = '';
    this.country = '';
    this.zip = '';
    this.dataSource.data = [];
    this.hasResults.set(false);
    this.error.set('');
  }

  private isSearchCriteriaEmpty(): boolean {
    return !this.addressId && !this.siteName && !this.address && 
           !this.city && !this.clliCode && !this.state && !this.country && !this.zip;
  }
}
