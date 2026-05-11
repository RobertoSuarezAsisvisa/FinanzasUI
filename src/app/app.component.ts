import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule, ConfirmDialogModule, ToastModule, ToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  menuOpen = false;

  constructor(readonly auth: AuthService, private readonly router: Router) {}

  readonly navItems = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', route: '/dashboard' },
    { label: 'Cuentas', icon: 'pi pi-wallet', route: '/accounts' },
    { label: 'Transacciones', icon: 'pi pi-arrow-right-arrow-left', route: '/transactions' },
    { label: 'Presupuestos', icon: 'pi pi-chart-pie', route: '/budgets' },
    { label: 'Metas ahorro', icon: 'pi pi-flag', route: '/goals/savings' },
    { label: 'Metas compra', icon: 'pi pi-shopping-bag', route: '/goals/purchases' },
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

  logout(): void {
    this.auth.logout();
  }
}
