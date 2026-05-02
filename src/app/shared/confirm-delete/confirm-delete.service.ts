import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ConfirmDeleteService {
  constructor(private readonly confirmation: ConfirmationService) {}

  ask(label: string, accept: () => void): void {
    this.confirmation.confirm({
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      message: `Eliminar ${label}. Esta accion no se puede deshacer.`,
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept
    });
  }
}
