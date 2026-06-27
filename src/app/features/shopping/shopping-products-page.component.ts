import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';

import { ApiService } from '../../core/api/api.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ShoppingPageComponent } from './shopping-page.component';

@Component({
  selector: 'app-shopping-products-page',
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
    FileUploadModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TabsModule,
    TextareaModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './shopping-products-page.component.html',
  styleUrl: './shopping-page.component.scss'
})
export class ShoppingProductsPageComponent extends ShoppingPageComponent {
  storeDialogVisible = false;
  productDialogVisible = false;
  variantDialogVisible = false;

  constructor(api: ApiService) {
    super(api);
  }

  onCatalogTabChange(value: string | number): void {
    if (value === 'stores' || value === 'products') {
      this.activeCatalogSection.set(value);
    }
  }

  openCreateStoreDialog(): void {
    this.cancelStoreEdit();
    this.storeDialogVisible = true;
  }

  openEditStoreDialog(store: { id: string; name: string; notes?: string | null }): void {
    this.editStore(store);
    this.storeDialogVisible = true;
  }

  closeStoreDialog(): void {
    this.cancelStoreEdit();
    this.storeDialogVisible = false;
  }

  submitStoreDialog(): void {
    this.createStore(() => {
      this.storeDialogVisible = false;
    });
  }

  openCreateProductDialog(): void {
    this.cancelProductEdit();
    this.productDialogVisible = true;
  }

  openEditProductDialog(product: { id: string; name: string; notes?: string | null }): void {
    this.editProduct(product);
    this.productDialogVisible = true;
  }

  closeProductDialog(): void {
    this.cancelProductEdit();
    this.productDialogVisible = false;
  }

  submitProductDialog(): void {
    this.createProduct(() => {
      this.productDialogVisible = false;
    });
  }

  openCreateVariantDialog(): void {
    this.cancelVariantEdit();
    this.variantDialogVisible = true;
  }

  openEditVariantDialog(variant: {
    id: string;
    productId: string;
    productName: string;
    name: string;
    normalizedQuantity: number;
    unit: 'Unit' | 'Gram' | 'Kilogram' | 'Milliliter' | 'Liter' | 'Pack';
    barcode?: string | null;
  }): void {
    this.editVariant(variant);
    this.variantDialogVisible = true;
  }

  closeVariantDialog(): void {
    this.cancelVariantEdit();
    this.variantDialogVisible = false;
  }

  submitVariantDialog(): void {
    this.createVariant(() => {
      this.variantDialogVisible = false;
    });
  }
}
