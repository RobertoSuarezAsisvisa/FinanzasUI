import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from './core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule, ConfirmDialogModule, ToastModule, ToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  menuOpen = false;
  sidebarCollapsed = false;
  expandedSections = new Set<string>(['Compras']);

  constructor(readonly auth: AuthService, private readonly router: Router) {}

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', route: '/dashboard' },
    { label: 'Cuentas', icon: 'pi pi-wallet', route: '/accounts' },
    { label: 'Tarjetas', icon: 'pi pi-credit-card', route: '/credit-cards' },
    { label: 'Transacciones', icon: 'pi pi-arrow-right-arrow-left', route: '/transactions' },
    { label: 'Presupuestos', icon: 'pi pi-chart-pie', route: '/budgets' },
    {
      label: 'Compras',
      icon: 'pi pi-shopping-cart',
      route: '/shopping',
      children: [
        { label: 'Productos', icon: 'pi pi-box', route: '/shopping/products' },
        { label: 'Precios', icon: 'pi pi-dollar', route: '/shopping/prices' },
        { label: 'Facturas', icon: 'pi pi-receipt', route: '/shopping/receipts' },
        { label: 'Listas', icon: 'pi pi-list-check', route: '/shopping/lists' }
      ]
    },
    { label: 'Metas', icon: 'pi pi-flag', route: '/goals' },
    { label: 'Deudas', icon: 'pi pi-credit-card', route: '/debts' },
    { label: 'Cripto', icon: 'pi pi-bitcoin', route: '/crypto' },
    { label: 'Categorias', icon: 'pi pi-sitemap', route: '/catalogs/categories' },
    { label: 'Tags', icon: 'pi pi-tags', route: '/catalogs/tags' },
    { label: 'Periodos', icon: 'pi pi-calendar-clock', route: '/settings/accounting-periods' },
    { label: 'Recurrentes', icon: 'pi pi-refresh', route: '/settings/recurring-rules' },
    { label: 'Contexto', icon: 'pi pi-sliders-h', route: '/settings/user-context' },
    { label: 'API Keys', icon: 'pi pi-key', route: '/settings/api-keys' }
  ];

  isAuthPage(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }

  toggleSidebar(): void {
    this.menuOpen = !this.menuOpen;
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleSection(label: string): void {
    if (this.expandedSections.has(label)) {
      this.expandedSections.delete(label);
      return;
    }

    this.expandedSections.add(label);
  }

  isSectionExpanded(item: NavItem): boolean {
    if (!item.children?.length) {
      return false;
    }

    return this.expandedSections.has(item.label) || this.isRouteActive(item.route, false);
  }

  isRouteActive(route?: string, exact = true): boolean {
    if (!route) {
      return false;
    }

    return this.router.isActive(route, {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    });
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
  }
}
