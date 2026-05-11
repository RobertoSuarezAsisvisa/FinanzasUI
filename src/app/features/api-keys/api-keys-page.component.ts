import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';

import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ApiKeysService } from '../../core/auth/api-keys.service';
import { UserApiKeySummary } from '../../core/auth/auth.models';

@Component({
  selector: 'app-api-keys-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TagModule, PageHeaderComponent, DatePipe],
  templateUrl: './api-keys-page.component.html',
  styleUrl: './api-keys-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiKeysPageComponent {
  private readonly apiKeysService = inject(ApiKeysService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly apiKeys = signal<UserApiKeySummary[]>([]);
  readonly generatedKey = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] })
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.apiKeysService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (apiKeys) => this.apiKeys.set(apiKeys),
        error: (error: Error) => {
          this.messageService.add({ severity: 'error', summary: 'API Keys', detail: error.message });
        }
      });
  }

  create(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.apiKeysService
      .create(this.form.getRawValue().name)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          this.generatedKey.set(response.apiKey);
          this.form.reset({ name: '' });
          this.apiKeys.update((apiKeys) => [response.summary, ...apiKeys]);
          this.messageService.add({ severity: 'success', summary: 'API Key creada', detail: 'Guarda la clave. Solo se muestra una vez.' });
        },
        error: (error: Error) => {
          this.messageService.add({ severity: 'error', summary: 'No se pudo crear', detail: error.message });
        }
      });
  }

  revoke(apiKey: UserApiKeySummary): void {
    this.confirmationService.confirm({
      header: 'Revocar API Key',
      message: `Se revocará "${apiKey.name}" y dejará de funcionar de inmediato.`,
      acceptLabel: 'Revocar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.apiKeysService.revoke(apiKey.id).subscribe({
          next: () => {
            this.apiKeys.update((items) =>
              items.map((item) =>
                item.id === apiKey.id ? { ...item, isRevoked: true, revokedAt: new Date().toISOString() } : item));
            this.messageService.add({ severity: 'success', summary: 'API Key revocada', detail: 'La clave ya no puede autenticarse.' });
          },
          error: (error: Error) => {
            this.messageService.add({ severity: 'error', summary: 'No se pudo revocar', detail: error.message });
          }
        });
      }
    });
  }

  remove(apiKey: UserApiKeySummary): void {
    this.confirmationService.confirm({
      header: 'Eliminar API Key',
      message: `Se eliminará "${apiKey.name}" de la lista del usuario.`,
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.apiKeysService.delete(apiKey.id).subscribe({
          next: () => {
            this.apiKeys.update((items) => items.filter((item) => item.id !== apiKey.id));
            this.messageService.add({ severity: 'success', summary: 'API Key eliminada', detail: 'La clave fue retirada.' });
          },
          error: (error: Error) => {
            this.messageService.add({ severity: 'error', summary: 'No se pudo eliminar', detail: error.message });
          }
        });
      }
    });
  }

  async copyGeneratedKey(): Promise<void> {
    const value = this.generatedKey();
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    this.messageService.add({ severity: 'info', summary: 'Copiada', detail: 'La API Key quedó en el portapapeles.' });
  }

  clearGeneratedKey(): void {
    this.generatedKey.set(null);
  }
}
