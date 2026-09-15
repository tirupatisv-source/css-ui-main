import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AdminService } from '../../core/services/admin.service';
import { UserSecurity } from '../../core/models/models';

/**
 * User management admin — converted from VB6 frmUserAccAdm.
 * Grid with user accounts and their 5 boolean role flags.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCheckboxModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  template: `
    <div class="header-row">
      <h2>User Management</h2>
      <button mat-mini-fab color="primary" matTooltip="Add User" (click)="addUser()">
        <mat-icon>person_add</mat-icon>
      </button>
    </div>

    @if (loading()) {
      <div class="spinner-wrapper"><mat-spinner></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="users()" class="full-width">
        <ng-container matColumnDef="userName">
          <th mat-header-cell *matHeaderCellDef>User Name</th>
          <td mat-cell *matCellDef="let row">{{ row.userName }}</td>
        </ng-container>
        <ng-container matColumnDef="userAccess">
          <th mat-header-cell *matHeaderCellDef>User Access</th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox [checked]="row.userAccess" disabled></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="dataAdmin">
          <th mat-header-cell *matHeaderCellDef>Data Admin</th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox [checked]="row.dataAdmin" disabled></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="projAdmin">
          <th mat-header-cell *matHeaderCellDef>Proj Admin</th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox [checked]="row.projAdmin" disabled></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="costAdmin">
          <th mat-header-cell *matHeaderCellDef>Cost Admin</th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox [checked]="row.costAdmin" disabled></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="userAdmin">
          <th mat-header-cell *matHeaderCellDef>User Admin</th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox [checked]="row.userAdmin" disabled></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button matTooltip="Edit" (click)="editUser(row)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Delete" color="warn" (click)="deleteUser(row)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    }
  `,
  styles: [`
    .header-row { display: flex; align-items: center; gap: 16px; }
    .full-width { width: 100%; }
    .spinner-wrapper { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class UsersComponent implements OnInit {
  displayedColumns = ['userName', 'userAccess', 'dataAdmin', 'projAdmin', 'costAdmin', 'userAdmin', 'actions'];
  loading = signal(false);
  users = signal<UserSecurity[]>([]);

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load users', 'Close', { duration: 4000 }); }
    });
  }

  addUser(): void {
    this.snackBar.open('Add User dialog — coming soon', 'OK', { duration: 2000 });
  }

  editUser(user: UserSecurity): void {
    this.snackBar.open('Edit User dialog — coming soon', 'OK', { duration: 2000 });
  }

  deleteUser(user: UserSecurity): void {
    if (!confirm(`Delete user "${user.userName}"?`)) return;
    this.adminService.deleteUser(user.userName!).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('User deleted', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 4000 })
    });
  }
}
