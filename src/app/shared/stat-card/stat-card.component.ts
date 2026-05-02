import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <article class="stat-card">
      <div class="stat-icon"><i [class]="icon || 'pi pi-chart-line'"></i></div>
      <div>
        <span>{{ label }}</span>
        <strong *ngIf="money; else plainValue">{{ value || 0 | currency: currency }}</strong>
        <ng-template #plainValue><strong>{{ value ?? '-' }}</strong></ng-template>
      </div>
    </article>
  `,
  styles: [
    `
      .stat-card {
        align-items: center;
        background: var(--surface-card);
        border: 1px solid var(--surface-200);
        border-radius: 0.5rem;
        display: flex;
        gap: 1rem;
        min-height: 7rem;
        padding: 1.25rem;
      }

      .stat-icon {
        align-items: center;
        background: #eaf7ef;
        border-radius: 0.5rem;
        color: #17633a;
        display: inline-flex;
        height: 2.75rem;
        justify-content: center;
        width: 2.75rem;
      }

      span {
        color: var(--text-color-secondary);
        display: block;
        font-size: 0.875rem;
      }

      strong {
        color: var(--text-color);
        display: block;
        font-size: 1.6rem;
        line-height: 1.2;
        margin-top: 0.25rem;
      }
    `
  ]
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input() value: string | number | null | undefined;
  @Input() icon = '';
  @Input() money = false;
  @Input() currency = 'USD';
}
