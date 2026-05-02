import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [value]="value || '-'" [severity]="severity"></p-tag>`
})
export class StatusTagComponent {
  @Input() value = '';

  get severity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const normalized = (this.value || '').toLowerCase();

    if (['active', 'open', 'inprogress', 'saving'].includes(normalized)) {
      return 'success';
    }

    if (['paid', 'completed', 'closed'].includes(normalized)) {
      return 'info';
    }

    if (['cancelled', 'inactive'].includes(normalized)) {
      return 'danger';
    }

    return 'secondary';
  }
}
