import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-money-cell',
  standalone: true,
  imports: [CurrencyPipe],
  template: `<span class="money">{{ value || 0 | currency: currency }}</span>`,
  styles: [
    `
      .money {
        color: var(--text-color);
        font-variant-numeric: tabular-nums;
        font-weight: 700;
      }
    `
  ]
})
export class MoneyCellComponent {
  @Input() value: number | null | undefined;
  @Input() currency = 'USD';
}
