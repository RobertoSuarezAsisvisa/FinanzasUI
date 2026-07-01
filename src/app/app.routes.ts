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
        path: 'credit-cards',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['creditCards'] }
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
        path: 'shopping',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'products'
          },
          {
            path: 'products',
            loadComponent: () => import('./features/shopping/shopping-products-page.component').then((m) => m.ShoppingProductsPageComponent)
          },
          {
            path: 'prices',
            loadComponent: () => import('./features/shopping/shopping-prices-page.component').then((m) => m.ShoppingPricesPageComponent)
          },
          {
            path: 'receipts',
            loadComponent: () => import('./features/shopping/shopping-receipts-page.component').then((m) => m.ShoppingReceiptsPageComponent)
          },
          {
            path: 'lists',
            loadComponent: () => import('./features/shopping/shopping-lists-page.component').then((m) => m.ShoppingListsPageComponent)
          }
        ]
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/resources/resource-page.component').then((m) => m.ResourcePageComponent),
        data: { resource: RESOURCE_DEFINITIONS['financialGoals'] }
      },
      { path: 'goals/savings', redirectTo: 'goals', pathMatch: 'full' },
      { path: 'goals/purchases', redirectTo: 'goals', pathMatch: 'full' },
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
      {
        path: 'settings/api-keys',
        loadComponent: () => import('./features/api-keys/api-keys-page.component').then((m) => m.ApiKeysPageComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
