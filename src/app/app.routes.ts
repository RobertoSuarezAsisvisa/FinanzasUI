import { Routes } from '@angular/router';
import { RESOURCE_DEFINITIONS } from './core/resource/resource-definitions';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-page.component').then((m) => m.AuthPageComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-page.component').then((m) => m.AuthPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['accounts'] }
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['transactions'] }
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['budgets'] }
      },
      {
        path: 'goals/savings',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['savingGoals'] }
      },
      {
        path: 'goals/purchases',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['purchaseGoals'] }
      },
      {
        path: 'debts',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['debts'] }
      },
      {
        path: 'crypto',
        redirectTo: 'crypto/accounts',
        pathMatch: 'full'
      },
      {
        path: 'crypto/accounts',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['cryptoAccounts'] }
      },
      {
        path: 'crypto/lots',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['cryptoLots'] }
      },
      {
        path: 'catalogs/categories',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['categories'] }
      },
      {
        path: 'catalogs/tags',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['tags'] }
      },
      {
        path: 'settings/accounting-periods',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['accountingPeriods'] }
      },
      {
        path: 'settings/recurring-rules',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['recurringRules'] }
      },
      {
        path: 'settings/user-context',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['userContext'] }
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
