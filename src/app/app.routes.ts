import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { networkAccessGuard } from './core/guards/network-access.guard';

/**
 * Route mapping converted from VB6 form navigation.
 * See MIGRATION_ANALYSIS.md Section 9: Form → Feature Mapping
 */
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // frmLogin → /login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // Logout page
  {
    path: 'logout',
    loadComponent: () => import('./features/auth/logout.component').then(m => m.LogoutComponent)
  },

  // Home — landing page after login (project-detail as landing page)
  {
    path: 'home',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/landing-page/landing-page.component').then(m => m.LandingPageComponent)
  },

  // frmWorkItems → /projects/:id/work-items
  {
    path: 'projects/:projectNum/work-items',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/work-items/work-items.component').then(m => m.WorkItemsComponent)
  },

  // frmRunList → /projects/:id/run-list
  {
    path: 'projects/:projectNum/run-list',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/run-list/run-list.component').then(m => m.RunListComponent)
  },

  // Run List Edit Wrapper → /projects/:projectNum/run-list-edit (alias for run-list with inline editing)
  {
    path: 'projects/:projectNum/run-list-edit',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/run-list/run-list.component').then(m => m.RunListComponent)
  },

  // Run List Upload → /projects/:projectNum/run-list-upload
  {
    path: 'projects/:projectNum/run-list-upload',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/run-list/run-list-upload.component').then(m => m.RunListUploadComponent)
  },

  // frmRptBom + Reports → /projects/:id/reports
  {
    path: 'projects/:projectNum/reports',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },

  // rptContactLst → /projects/:projectNum/reports/contact-list
  {
    path: 'projects/:projectNum/reports/contact-list',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/reports/contact-list.component').then(m => m.ContactListComponent)
  },

  // rptTitlePage → /projects/:projectNum/reports/title-page
  {
    path: 'projects/:projectNum/reports/title-page',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/reports/title-page.component').then(m => m.TitlePageComponent)
  },

  // rptInventoryDate → /projects/:projectNum/reports/inventory-date
  {
    path: 'projects/:projectNum/reports/inventory-date',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/reports/inventory-list-date.component').then(m => m.InventoryListDateComponent)
  },

  // Edit → /projects/:projectNum/edit
  {
    path: 'projects/:projectNum/edit',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/edit/edit.component').then(m => m.EditComponent)
  },

  // Notes → /projects/:projectNum/notes
  {
    path: 'projects/:projectNum/notes',
    canActivate: [authGuard, networkAccessGuard],
    loadComponent: () => import('./features/notes/notes.component').then(m => m.NotesComponent)
  },

  // frmAdmMenu and sub-forms → /admin/**
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard, networkAccessGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    children: [
      {
        path: 'password',
        loadComponent: () => import('./features/admin/password.component').then(m => m.PasswordComponent)
      },
      {
        path: 'material-category',
        loadComponent: () => import('./features/admin/material-category.component').then(m => m.MaterialCategoryComponent)
      },
      {
        path: 'runlist-category',
        loadComponent: () => import('./features/admin/runlist-category.component').then(m => m.RunlistCategoryComponent)
      },
      {
        path: 'user-access',
        loadComponent: () => import('./features/admin/user-access.component').then(m => m.UserAccessComponent)
      },
      {
        path: 'parts',
        loadComponent: () => import('./features/admin/parts-list.component').then(m => m.PartsListComponent)
      },
      {
        path: 'runlist-association',
        loadComponent: () => import('./features/admin/runlist-association.component').then(m => m.RunlistAssociationComponent)
      },
      {
        path: 'vendor',
        loadComponent: () => import('./features/admin/vendor.component').then(m => m.VendorComponent)
      },
      {
        path: 'part-association',
        loadComponent: () => import('./features/admin/part-association.component').then(m => m.PartAssociationComponent)
      },
      {
        path: 'cable-type',
        loadComponent: () => import('./features/admin/cable-type.component').then(m => m.CableTypeComponent)
      },
      {
        path: 'unit-of-measure',
        loadComponent: () => import('./features/admin/unit-of-measure.component').then(m => m.UnitOfMeasureComponent)
      },
      {
        path: 'part-association-table',
        loadComponent: () => import('./features/admin/part-association-table.component').then(m => m.PartAssociationTableComponent)
      },
      {
        path: 'cable-color',
        loadComponent: () => import('./features/admin/cable-color.component').then(m => m.CableColorComponent)
      },
      {
        path: 'earthquake-zone',
        loadComponent: () => import('./features/admin/earthquake-zone.component').then(m => m.EarthquakeZoneComponent)
      },
      {
        path: 'work-item-operation',
        loadComponent: () => import('./features/admin/work-item-operation.component').then(m => m.WorkItemOperationComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./features/admin/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users.component').then(m => m.UsersComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
