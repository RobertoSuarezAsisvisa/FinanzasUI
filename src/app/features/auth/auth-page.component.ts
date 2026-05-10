import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../core/auth/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, CardModule, InputTextModule, PasswordModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>(this.router.url.includes('register') ? 'register' : 'login');
  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly title = computed(() => (this.mode() === 'login' ? 'Iniciar sesion' : 'Crear cuenta'));
  readonly submitLabel = computed(() => (this.mode() === 'login' ? 'Entrar' : 'Registrarme'));

  readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const value = this.form.getRawValue();
    const request =
      this.mode() === 'login'
        ? this.auth.login({ email: value.email, password: value.password })
        : this.auth.register({ email: value.email, password: value.password, displayName: value.displayName });

    request.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: Error) => {
        this.error.set(error.message || 'No se pudo iniciar sesion.');
        this.loading.set(false);
      }
    });
  }

  async google(): Promise<void> {
    this.googleLoading.set(true);
    this.error.set(null);
    try {
      await this.auth.loginWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo iniciar sesion con Google.');
    } finally {
      this.googleLoading.set(false);
    }
  }
}
