import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { ApiService } from '../../core/api/api.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ShoppingPageComponent } from './shopping-page.component';

@Component({
  selector: 'app-shopping-prices-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    PageHeaderComponent,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './shopping-prices-page.component.html',
  styleUrl: './shopping-page.component.scss'
})
export class ShoppingPricesPageComponent extends ShoppingPageComponent {
  priceDialogVisible = false;

  constructor(api: ApiService) {
    super(api);
  }

  openCreatePriceDialog(): void {
    this.message.set(null);
    this.priceDialogVisible = true;
  }

  closePriceDialog(): void {
    this.priceDialogVisible = false;
  }

  submitPriceDialog(): void {
    this.createPrice(() => {
      this.priceDialogVisible = false;
    });
  }
}
