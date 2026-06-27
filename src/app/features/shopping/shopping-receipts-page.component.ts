import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { ApiService } from '../../core/api/api.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ShoppingPageComponent } from './shopping-page.component';

@Component({
  selector: 'app-shopping-receipts-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    PageHeaderComponent,
    ButtonModule,
    FileUploadModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './shopping-receipts-page.component.html',
  styleUrl: './shopping-page.component.scss'
})
export class ShoppingReceiptsPageComponent extends ShoppingPageComponent {
  constructor(api: ApiService) {
    super(api);
  }
}
