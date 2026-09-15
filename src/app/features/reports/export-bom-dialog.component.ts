import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent, DialogOption } from '../../shared/dialogs/confirm-dialog.component';
import { AddressLookupDialog, AddressResult } from '../../shared/dialogs/address-lookup.dialog';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-bom-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule
  ],
  templateUrl: './export-bom-dialog.component.html',
  styleUrls: ['./export-bom-dialog.component.scss']
})
export class ExportBomDialogComponent implements OnInit {
  tabIndex = 0;
  form: FormGroup;
  bomItems: any[] = [];
  readonly SAP_DEFAULTS = {
    sap: {
      purchaseReqDocType: 'NB',
      purchasingGroup: 'B00',
      costElement: '59999000',
      accountAssignmentCategory: 'P'
    }
  };

  constructor(
    public dialogRef: MatDialogRef<ExportBomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      // Tab 1
      projectNumber: [data.projectNumber || ''],
      originator: [''],  // Will be populated from auth service in ngOnInit
      requesterCUID: [data.requesterCUID || ''],  // Requisitioner CUID
      netBuildId: [data.netBuildId || ''],
      dateRequired: [data.dateRequired || ''],
      // Tab 2
      shipping: this.fb.group({
        addressId: [''],
        address: [''],
        state: [''],
        zip: [''],
        siteName: [''],
        city: [''],
        country: [''],
        clliCd: [''],
        plant: [''],
        logisticsLocationName: ['']
      }),
      // Tab 3
      install: this.fb.group({
        addressId: [''],
        address: [''],
        state: [''],
        zip: [''],
        siteName: [''],
        city: [''],
        country: [''],
        clliCd: [''],
        plant: [''],
        logisticsLocationName: ['']
      }),
      // Tab 4
      sap: this.fb.group({
        purchaseReqDocType: [''],
        purchasingDocCategory: [''],
        purchasingGroup: [''],
        costElement: [''],
        itemCategory: [''],
        deletionIndicator: [''],
        accountAssignmentCategory: [''],
        wbsNumber: [''],
        mainAssistNumber: [''],
        company: [''],
        requestingOrg: [''],
        unloadingPoint: [''],
        costCenter: [''],
        orderNumber: [''],
        purchasingOrg: [''],
        eidCode: [''],
        fixedVendor: [''],
        price: [''],
        lastBid: [''],
        itemText: ['']
      })
    });
  }
  

  ngOnInit(): void {
    this.form.patchValue(this.SAP_DEFAULTS);
    // Populate originator with current logged-in user's CUID
    const cuid = this.authService.getCuid();
    if (cuid) {
      this.form.patchValue({ originator: cuid });
    }

    // Fetch BOM items for the project
    if (this.data.projectNumber) {
      this.http.get<any>(`${environment.apiUrl}/api/projects/${this.data.projectNumber}/bom`)
        .subscribe({
          next: (items: any) => {
            console.log('[ExportBOM] Fetched BOM items:', items);
            this.bomItems = items || [];
          },
          error: (err: any) => {
            console.error('[ExportBOM] Failed to fetch BOM items:', err);
            this.bomItems = [];
          }
        });
    }
  }

  get shippingGroup(): FormGroup {
    return (this.form.get('shipping') as FormGroup) ?? new UntypedFormGroup({});
  }
  get installGroup(): FormGroup {
    return (this.form.get('install') as FormGroup) ?? new UntypedFormGroup({});
  }
  get sapGroup(): FormGroup {
    return (this.form.get('sap') as FormGroup) ?? new UntypedFormGroup({});
  }

  /**
   * Open address lookup dialog for shipping address
   */
  openShippingAddressLookup(): void {
    const dialogRef = this.matDialog.open(AddressLookupDialog, {
      width: '500px',
      disableClose: false,
      data: { projectNum: this.form.get('projectNumber')?.value || '' }
    });

    dialogRef.afterClosed().subscribe((result: AddressResult | undefined) => {
      if (result) {
        console.log('[ExportBOM] Shipping address selected:', result);
        this.shippingGroup.patchValue({
          addressId: result.addressId,
          siteName: result.siteName,
          address: result.address,
          city: result.city,
          state: result.state,
          zip: result.zip,
          country: result.country || '',
          clliCd: result.clliCd || '',
          plant: result.plant || '',
          logisticsLocationName: result.logisticsLocationName || ''
        });
      }
    });
  }

  /**
   * Open address lookup dialog for installation address
   */
  openInstallAddressLookup(): void {
    const dialogRef = this.matDialog.open(AddressLookupDialog, {
      width: '500px',
      disableClose: false,
      data: { projectNum: this.form.get('projectNumber')?.value || '' }
    });

    dialogRef.afterClosed().subscribe((result: AddressResult | undefined) => {
      if (result) {
        console.log('[ExportBOM] Install address selected:', result);
        this.installGroup.patchValue({
          addressId: result.addressId,
          siteName: result.siteName,
          address: result.address,
          city: result.city,
          state: result.state,
          zip: result.zip,
          country: result.country || '',
          clliCd: result.clliCd || '',
          plant: result.plant || '',
          logisticsLocationName: result.logisticsLocationName || ''
        });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  exportExcel() {
    console.log('[ExportBOM] Showing format selection dialog...');
    
    // Format options for export
    const formatOptions: DialogOption[] = [
      { label: 'CSV', value: 'csv', color: 'primary' },  // Orange
      { label: 'Excel', value: 'excel' }  // White with blue hover
    ];
    
    // Open format selection using enhanced confirm dialog
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      panelClass: ['themed-dialog'],
      data: {
        title: 'Export Format',
        message: 'Select your export format:',
        dialogType: 'format-selection',
        options: formatOptions
      }
    });

    dialogRef.afterClosed().subscribe((format: string) => {
      if (format) {
        const formData = this.form.value;
        if (format === 'csv') {
          console.log('[ExportBOM] User selected CSV format');
          this.generateAndDownloadCSV(formData);
        } else if (format === 'excel') {
          console.log('[ExportBOM] User selected Excel format');
          this.generateAndDownloadXLSX(formData);
        }
      }
    });
  }

  private generateAndDownloadCSV(formData: any): void {
    console.log('[ExportBOM] Generating SAP BOM CSV format...');
    
    // Create CSV with proper SAP structure
    const csvContent = this.generateSAPBOMCSVFromVB6(formData);
    
    // Download as CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `BOM_${formData.projectNumber || 'export'}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[ExportBOM] CSV file exported successfully');
    this.dialogRef.close('exported');
  }

  private generateAndDownloadXLSX(formData: any): void {
    console.log('[ExportBOM] Generating SAP BOM Excel format...');
    
    // Generate CSV content
    const csvContent = this.generateSAPBOMCSVFromVB6(formData);
    
    // Parse CSV content to 2D array for XLSX
    const lines = csvContent.split('\n').filter(line => line.trim());
    const data: any[][] = [];
    
    for (const line of lines) {
      const row: any[] = [];
      let cell = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          row.push(cell);
          cell = '';
        } else {
          cell += char;
        }
      }
      if (cell || line.endsWith(',')) {
        row.push(cell);
      }
      if (row.length > 0) {
        data.push(row);
      }
    }
    
    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BOM');
    
    // Download as XLSX file
    XLSX.writeFile(wb, `BOM_${formData.projectNumber || 'export'}.xlsx`);
    
    console.log('[ExportBOM] Excel file exported successfully');
    this.dialogRef.close('exported');
  }

  private generateSAPBOMCSVFromVB6(formData: any): string {
    console.log('[ExportBOM] Generating SAP BOM CSV format (based on VB6 logic with updated requirements)...');
    
    // SAP header rows structure (31 columns - X column removed)
    const headers = [
      // Row 1: Field descriptions
      ['Field description', 'Purchase Requisition Document Type', 'Material Number', 'Plant', 'Purchase Requisition Quantity', 'Item Number of Purchase Requisition', 'Serial number of Account assignment line item', 'Cost center/G/L account', 'Qty of division for split account assignment', '% of division split account assignment', 'Delivery Date', 'Requirement Tracking Number', 'Name of Requisitioner/Requester', 'Account Assignment Category', 'Cost Center', 'Work Breakdown Structure Element (WBS Element)', 'Order Number', 'Main Asset Number', 'Item Category in Purchasing Document', 'Short Text', 'Storage Location', 'Purchasing Group', 'Purchasing Organization', 'Delivery address', 'Final Destination Address', 'Requesting Org', 'EID Code', 'Network Order ID', 'PR to be Hold Status', 'Status Message', 'PR number Generated'],
      // Row 2: Table names
      ['Table', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'MEACCT1000', 'MEACCT1000', 'MEACCT1000', 'MEACCT1000', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBKN', 'EBKN', 'EBKN', 'EBKN', 'EBKN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', 'EBAN', '', 'EBAN'],
      // Row 3: Field codes
      ['Field', 'BSART', 'MATNR', 'WERKS', 'MENGE', 'BNFPO', 'ZEXKN', 'SAKTO1', 'MENGE1', 'VPROZ', 'LFDAT', 'BEDNR', 'AFNAM', 'KNTTP', 'KOSTL', 'PS_PSP_PNR', 'AUFNR', 'ANLN1', 'PSTYP', 'TXZ01', 'LGORT', 'EKGRP', 'EKORG', 'ADRN2', 'ZZ1_FINAL_DEST_AD_PRI', 'ZZ1_REQUESTING_ORG_PRI', 'ZZ1_EIDCODE1_PRI', 'ZZ1_NETBUILD1_PRI', 'STATU', '', 'BANFN'],
      // Row 4: Data types
      ['Data type', 'CHAR', 'CHAR', 'CHAR', 'QUAN', 'NUMC', 'NUMC', 'CHAR', 'QUAN', 'DEC', 'DATS', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', 'CHAR', '', 'CHAR'],
      // Row 5: Field max lengths
      ['Field max length', '4', '18', '4', '13', '5', '2', '10', '13', '3', '3', '1', '8', '10', '12', '1', '10', '10', '12', '12', '1', '40', '4', '3', '4', '10', '10', '10', '7', '7', '40', '10'],
      // Row 6: Check tables
      ['Check table/Format', 'T161', 'MARA', 'T001W', 'NA', 'PR#-Item#', 'NA', 'SKA1', 'NA', 'NA', 'YYYYMMDD', 'NA', 'NA', 'T163K', 'CSKS', 'PRPS', 'AUFK', 'ANLH', 'T163', 'NA', 'T001L', 'T024', 'T024E', 'ADRC', 'NA', 'NA', 'NA', 'NA', 'NA', '', 'NA'],
      // Row 7: Mandatory/Optional
      ['Mandatory/Optional', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'O', 'O', 'M', 'M', 'M', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ];

    // Get form data
    const shippingGroup = this.shippingGroup.value;
    const installGroup = this.installGroup.value;
    const sapGroup = this.sapGroup.value;

    // Build CSV content
    let csvContent = '';

    // Add header rows (rows 1-7)
    headers.forEach(row => {
      csvContent += row.map(cell => this.escapeCsvValue(cell)).join(',') + '\n';
    });

    // Helper function to remove leading zeros
    const removeLeadingZeros = (value: string): string => {
      if (!value) return '';
      return value.replace(/^0+/, '') || '0';
    };

    // If BOM items exist, create a row for each item; otherwise, create a single header row
    if (this.bomItems && this.bomItems.length > 0) {
      console.log('[ExportBOM] Adding', this.bomItems.length, 'BOM items to CSV');
      
      this.bomItems.forEach((item, index) => {
        const dataRow = [
          (index + 1).toString(),  // Line item number
          'ZNB',  // Column B: Document Type
          item.itemId || '',  // Column C: SAP Item ID (from BOM itemId)
          '3057',  // Column D: Plant (hardcoded to 3057)
          (item.quantity || 1).toString(),  // Column E: Purchase Requisition Quantity (from BOM quantity)
          `1-${index + 1}`,  // Column F: Item Number (format like "1-1", "1-2", "1-3", etc.)
          '',  // Column G: Serial number
          '59999000',  // Column H: Cost center/G/L account (hardcoded to 59999000)
          '',  // Column I: Qty of division
          '',  // Column J: % of division
          this.formatDateForSAP(formData.dateRequired),  // Column K: Delivery Date (YYYYMMDD format)
          formData.netBuildId || '',  // Column L: Requirement Tracking Number (from NetBuild ID)
          formData.originator || '',  // Column M: Name of Requisitioner/Requester (CUID - auto-populated)
          sapGroup.accountAssignmentCategory || '',  // Column N: Account Assignment Category
          sapGroup.costCenter || '',  // Column O: Cost Center
          sapGroup.wbsNumber || '',  // Column P: WBS Element
          sapGroup.orderNumber || '',  // Column Q: Order Number
          sapGroup.mainAssistNumber || '',  // Column R: Main Asset Number
          sapGroup.itemCategory || '',  // Column S: Item Category
          '',  // Column T: Short Text (empty as per requirements)
          '',  // Column U: Storage Location
          'B00',  // Column V: Purchasing Group (hardcoded to B00)
          sapGroup.purchasingOrg || '',  // Column W: Purchasing Organization
          removeLeadingZeros(shippingGroup.addressId || ''),  // Column X: Delivery address (remove leading zeros)
          removeLeadingZeros(installGroup.addressId || ''),  // Column Y: Final Destination Address (remove leading zeros - from install address)
          '',  // Column Z: Requesting Org
          sapGroup.eidCode || '',  // Column AA: EID Code
          formData.netBuildId || '',  // Column AB: Network Order ID (from NetBuild ID)
          '',  // Column AC: PR to be Hold Status
          '',  // Column AD: Status Message
          ''  // Column AE: PR number Generated (empty as per requirements)
        ];

        csvContent += dataRow.map(cell => this.escapeCsvValue(cell)).join(',') + '\n';
      });
    } else {
      // No BOM items, create a single row (backward compatibility)
      console.log('[ExportBOM] No BOM items found, creating single data row');
      const dataRow = [
        '1',  // Line item number
        'ZNB',  // Column B: Document Type
        sapGroup.purchaseReqDocType || '',  // Column C: SAP Item ID
        '3057',  // Column D: Plant (hardcoded to 3057)
        '',  // Column E: Purchase Requisition Quantity
        '1-1',  // Column F: Item Number (format like "1-1")
        '',  // Column G: Serial number
        '59999000',  // Column H: Cost center/G/L account (hardcoded to 59999000)
        '',  // Column I: Qty of division
        '',  // Column J: % of division
        this.formatDateForSAP(formData.dateRequired),  // Column K: Delivery Date (YYYYMMDD format)
        formData.netBuildId || '',  // Column L: Requirement Tracking Number (from NetBuild ID)
        formData.originator || '',  // Column M: Name of Requisitioner/Requester (CUID - auto-populated)
        sapGroup.accountAssignmentCategory || '',  // Column N: Account Assignment Category
        sapGroup.costCenter || '',  // Column O: Cost Center
        sapGroup.wbsNumber || '',  // Column P: WBS Element
        sapGroup.orderNumber || '',  // Column Q: Order Number
        sapGroup.mainAssistNumber || '',  // Column R: Main Asset Number
        sapGroup.itemCategory || '',  // Column S: Item Category
        '',  // Column T: Short Text (empty as per requirements)
        '',  // Column U: Storage Location
        'B00',  // Column V: Purchasing Group (hardcoded to B00)
        sapGroup.purchasingOrg || '',  // Column W: Purchasing Organization
        removeLeadingZeros(shippingGroup.addressId || ''),  // Column X: Delivery address (remove leading zeros)
        removeLeadingZeros(installGroup.addressId || ''),  // Column Y: Final Destination Address (remove leading zeros - from install address)
        '',  // Column Z: Requesting Org
        sapGroup.eidCode || '',  // Column AA: EID Code
        formData.netBuildId || '',  // Column AB: Network Order ID (from NetBuild ID)
        '',  // Column AC: PR to be Hold Status
        '',  // Column AD: Status Message
        ''  // Column AE: PR number Generated (empty as per requirements)
      ];

      csvContent += dataRow.map(cell => this.escapeCsvValue(cell)).join(',') + '\n';
    }

    console.log('[ExportBOM] CSV content generated, length:', csvContent.length, 'total rows:', headers.length + Math.max(1, this.bomItems?.length || 1));
    return csvContent;
  }

  private formatDateForSAP(dateString: string): string {
    if (!dateString) return '';
    
    // Convert JS date format to SAP YYYYMMDD format
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    } catch (e) {
      console.warn('[ExportBOM] Failed to format date:', dateString);
      return dateString;
    }
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = value.toString();

    // Escape quotes and wrap in quotes if contains comma, quotes, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
  }
}
