import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <header class="page-header">
      <div class="page-title">
        <span class="page-icon" *ngIf="icon"><i [class]="icon"></i></span>
        <div>
          <h1>{{ title }}</h1>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <ng-content></ng-content>
    </header>
  `,
  styles: [
    `
      .page-header {
        align-items: center;
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }

      .page-title {
        align-items: center;
        display: flex;
        gap: 0.875rem;
        min-width: 0;
      }

      .page-icon {
        align-items: center;
        background: var(--surface-100);
        border: 1px solid var(--surface-200);
        border-radius: 0.5rem;
        color: var(--primary-color);
        display: inline-flex;
        height: 2.75rem;
        justify-content: center;
        width: 2.75rem;
      }

      h1 {
        color: var(--text-color);
        font-size: 1.55rem;
        line-height: 1.2;
        margin: 0;
      }

      p {
        color: var(--text-color-secondary);
        margin: 0.25rem 0 0;
      }

      @media (max-width: 720px) {
        .page-header {
          align-items: stretch;
          flex-direction: column;
        }
      }
    `
  ]
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
