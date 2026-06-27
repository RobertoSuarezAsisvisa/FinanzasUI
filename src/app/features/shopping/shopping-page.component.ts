import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { ApiService } from '../../core/api/api.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

type Id = string;
type ShoppingUnit = 'Unit' | 'Gram' | 'Kilogram' | 'Milliliter' | 'Liter' | 'Pack';
type ShoppingSection = 'catalog' | 'prices' | 'receipts' | 'lists';
type CatalogSection = 'stores' | 'products';

interface StoreSummary {
  id: Id;
  name: string;
  notes?: string | null;
}

interface ProductSummary {
  id: Id;
  name: string;
  categoryId?: Id | null;
  notes?: string | null;
}

interface ProductVariantSummary {
  id: Id;
  productId: Id;
  productName: string;
  name: string;
  normalizedQuantity: number;
  unit: ShoppingUnit;
  barcode?: string | null;
}

interface StoreProductPriceSummary {
  id: Id;
  storeId: Id;
  storeName: string;
  productVariantId: Id;
  productName: string;
  variantName: string;
  totalPrice: number;
  normalizedQuantity: number;
  unit: ShoppingUnit;
  unitPrice: number;
  observedAt: string;
  source: string;
}

interface ShoppingListSummary {
  id: Id;
  name: string;
  listDate: string;
  items: ShoppingListItemSummary[];
}

interface ShoppingListItemSummary {
  id: Id;
  productVariantId: Id;
  productName: string;
  variantName: string;
  desiredQuantity: number;
  unit: ShoppingUnit;
}

interface ReceiptImportSummary {
  id: Id;
  storeId?: Id | null;
  storeName?: string | null;
  detectedStoreName?: string | null;
  receiptDate?: string | null;
  fileName: string;
  status: 'PendingReview' | 'Confirmed' | 'Cancelled';
  lines: ReceiptImportLineSummary[];
}

interface ReceiptImportLineSummary {
  id?: Id;
  productName: string;
  variantName: string;
  quantity: number;
  unit: ShoppingUnit;
  totalPrice: number;
  unitPrice: number;
  productVariantId?: Id | null;
}

interface RecommendationSummary {
  shoppingListId: Id;
  estimatedTotal: number;
  estimatedSavings: number;
  storeGroups: RecommendationStoreGroup[];
  missingItems: RecommendationMissingItem[];
}

interface RecommendationStoreGroup {
  storeId: Id;
  storeName: string;
  subtotal: number;
  items: RecommendationItem[];
}

interface RecommendationItem {
  productVariantId: Id;
  productName: string;
  variantName: string;
  desiredQuantity: number;
  unit: ShoppingUnit;
  unitPrice: number;
  estimatedPrice: number;
  observedAt: string;
}

interface RecommendationMissingItem {
  productVariantId: Id;
  productName: string;
  variantName: string;
  desiredQuantity: number;
  unit: ShoppingUnit;
}

interface DraftListItem {
  productVariantId: Id | null;
  desiredQuantity: number;
  unit: ShoppingUnit;
  notes: string;
}

@Component({
  selector: 'app-shopping-page',
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
    TextareaModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './shopping-page.component.html',
  styleUrl: './shopping-page.component.scss'
})
export class ShoppingPageComponent implements OnInit {
  readonly shoppingSection = input<ShoppingSection>('catalog');
  readonly units: ShoppingUnit[] = ['Unit', 'Gram', 'Kilogram', 'Milliliter', 'Liter', 'Pack'];
  readonly activeTab = computed(() => this.shoppingSection());
  readonly activeCatalogSection = signal<CatalogSection>('stores');
  readonly loading = signal(false);
  readonly message = signal<string | null>(null);
  readonly stores = signal<StoreSummary[]>([]);
  readonly products = signal<ProductSummary[]>([]);
  readonly variants = signal<ProductVariantSummary[]>([]);
  readonly prices = signal<StoreProductPriceSummary[]>([]);
  readonly receipts = signal<ReceiptImportSummary[]>([]);
  readonly lists = signal<ShoppingListSummary[]>([]);
  readonly selectedReceipt = signal<ReceiptImportSummary | null>(null);
  readonly recommendation = signal<RecommendationSummary | null>(null);
  readonly selectedUploadFile = signal<File | null>(null);

  storeForm = { name: '', notes: '' };
  editingStoreId: Id | null = null;
  productForm = { name: '', notes: '' };
  editingProductId: Id | null = null;
  variantForm: { productId: Id | null; name: string; normalizedQuantity: number; unit: ShoppingUnit; barcode: string } = {
    productId: null,
    name: '',
    normalizedQuantity: 1,
    unit: 'Unit',
    barcode: ''
  };
  editingVariantId: Id | null = null;
  priceForm: { storeId: Id | null; productVariantId: Id | null; totalPrice: number; normalizedQuantity: number; unit: ShoppingUnit; observedAt: string; notes: string } = {
    storeId: null,
    productVariantId: null,
    totalPrice: 1,
    normalizedQuantity: 1,
    unit: 'Unit',
    observedAt: this.todayForInput(),
    notes: ''
  };
  listForm = {
    name: 'Lista de compras',
    listDate: this.todayForInput(),
    items: [{ productVariantId: null, desiredQuantity: 1, unit: 'Unit' as ShoppingUnit, notes: '' }] as DraftListItem[]
  };
  receiptConfirmStoreId: Id | null = null;

  readonly variantOptions = computed(() =>
    this.variants().map((variant) => ({
      label: `${variant.productName} - ${variant.name}`,
      value: variant.id,
      unit: variant.unit,
      normalizedQuantity: variant.normalizedQuantity
    }))
  );

  readonly shoppingSections: Array<{ key: ShoppingSection; label: string; icon: string; route: string }> = [
    { key: 'catalog', label: 'Productos', icon: 'pi pi-box', route: '/shopping/products' },
    { key: 'prices', label: 'Precios', icon: 'pi pi-dollar', route: '/shopping/prices' },
    { key: 'receipts', label: 'Facturas', icon: 'pi pi-receipt', route: '/shopping/receipts' },
    { key: 'lists', label: 'Listas', icon: 'pi pi-list-check', route: '/shopping/lists' }
  ];

  readonly catalogSections: Array<{ key: CatalogSection; label: string; icon: string }> = [
    { key: 'stores', label: 'Tiendas', icon: 'pi pi-building' },
    { key: 'products', label: 'Productos', icon: 'pi pi-box' }
  ];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.message.set(null);
    this.reloadAll();
  }

  reloadAll(): void {
    this.loading.set(true);
    this.message.set(null);
    this.api.get<StoreSummary[]>('shopping/stores').subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.loadProducts();
      },
      error: (error) => this.fail(error)
    });
  }

  createStore(afterSuccess?: () => void): void {
    if (!this.storeForm.name.trim()) {
      return;
    }

    const request = this.editingStoreId
      ? this.api.put<StoreSummary>(`shopping/stores/${this.editingStoreId}`, this.storeForm)
      : this.api.post<StoreSummary>('shopping/stores', this.storeForm);

    request.subscribe({
      next: () => {
        this.cancelStoreEdit();
        afterSuccess?.();
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  editStore(store: StoreSummary): void {
    this.editingStoreId = store.id;
    this.storeForm = { name: store.name, notes: store.notes ?? '' };
  }

  cancelStoreEdit(): void {
    this.editingStoreId = null;
    this.storeForm = { name: '', notes: '' };
  }

  deleteStore(store: StoreSummary): void {
    this.api.delete<void>(`shopping/stores/${store.id}`).subscribe({
      next: () => {
        if (this.editingStoreId === store.id) {
          this.cancelStoreEdit();
        }
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  createProduct(afterSuccess?: () => void): void {
    if (!this.productForm.name.trim()) {
      return;
    }

    const body = { ...this.productForm, categoryId: null };
    const request = this.editingProductId
      ? this.api.put<ProductSummary>(`shopping/products/${this.editingProductId}`, body)
      : this.api.post<ProductSummary>('shopping/products', body);

    request.subscribe({
      next: () => {
        this.cancelProductEdit();
        afterSuccess?.();
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  editProduct(product: ProductSummary): void {
    this.editingProductId = product.id;
    this.productForm = { name: product.name, notes: product.notes ?? '' };
  }

  cancelProductEdit(): void {
    this.editingProductId = null;
    this.productForm = { name: '', notes: '' };
  }

  deleteProduct(product: ProductSummary): void {
    this.api.delete<void>(`shopping/products/${product.id}`).subscribe({
      next: () => {
        if (this.editingProductId === product.id) {
          this.cancelProductEdit();
        }
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  createVariant(afterSuccess?: () => void): void {
    if (!this.variantForm.productId || !this.variantForm.name.trim()) {
      return;
    }

    const request = this.editingVariantId
      ? this.api.put<ProductVariantSummary>(`shopping/variants/${this.editingVariantId}`, this.variantForm)
      : this.api.post<ProductVariantSummary>('shopping/variants', this.variantForm);

    request.subscribe({
      next: () => {
        this.cancelVariantEdit();
        afterSuccess?.();
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  editVariant(variant: ProductVariantSummary): void {
    this.editingVariantId = variant.id;
    this.variantForm = {
      productId: variant.productId,
      name: variant.name,
      normalizedQuantity: variant.normalizedQuantity,
      unit: variant.unit,
      barcode: variant.barcode ?? ''
    };
  }

  cancelVariantEdit(): void {
    this.editingVariantId = null;
    this.variantForm = { productId: null, name: '', normalizedQuantity: 1, unit: 'Unit', barcode: '' };
  }

  deleteVariant(variant: ProductVariantSummary): void {
    this.api.delete<void>(`shopping/variants/${variant.id}`).subscribe({
      next: () => {
        if (this.editingVariantId === variant.id) {
          this.cancelVariantEdit();
        }
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  createPrice(afterSuccess?: () => void): void {
    if (!this.priceForm.storeId || !this.priceForm.productVariantId) {
      return;
    }

    this.api.post<StoreProductPriceSummary>('shopping/prices', {
      ...this.priceForm,
      observedAt: new Date(this.priceForm.observedAt).toISOString()
    }).subscribe({
      next: () => {
        this.priceForm = { storeId: null, productVariantId: null, totalPrice: 1, normalizedQuantity: 1, unit: 'Unit', observedAt: this.todayForInput(), notes: '' };
        afterSuccess?.();
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  addListItem(): void {
    this.listForm.items.push({ productVariantId: null, desiredQuantity: 1, unit: 'Unit', notes: '' });
  }

  removeListItem(index: number): void {
    this.listForm.items.splice(index, 1);
  }

  createList(): void {
    const items = this.listForm.items.filter((item) => item.productVariantId);
    if (!this.listForm.name.trim() || items.length === 0) {
      return;
    }

    this.api.post<ShoppingListSummary>('shopping/lists', {
      name: this.listForm.name,
      listDate: new Date(this.listForm.listDate).toISOString(),
      transactionId: null,
      items
    }).subscribe({
      next: (list) => {
        this.listForm = { name: 'Lista de compras', listDate: this.todayForInput(), items: [{ productVariantId: null, desiredQuantity: 1, unit: 'Unit', notes: '' }] };
        this.loadLists(() => this.recommend(list.id));
      },
      error: (error) => this.fail(error)
    });
  }

  recommend(id: Id): void {
    this.api.get<RecommendationSummary>(`shopping/lists/${id}/recommendation`).subscribe({
      next: (recommendation) => this.recommendation.set(recommendation),
      error: (error) => this.fail(error)
    });
  }

  chooseUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedUploadFile.set(input.files?.[0] ?? null);
  }

  analyzeReceipt(): void {
    const file = this.selectedUploadFile();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    this.loading.set(true);
    this.api.postForm<ReceiptImportSummary>('shopping/receipt-imports/analyze', formData).subscribe({
      next: (receipt) => {
        this.selectedReceipt.set(receipt);
        this.receiptConfirmStoreId = this.findStoreId(receipt.detectedStoreName) ?? null;
        if (receipt.lines.length === 0) {
          this.addReceiptLine(receipt);
          this.message.set('Gemini no detecto productos. Completa al menos una linea manualmente antes de confirmar.');
        }
        this.loadReceipts();
      },
      error: (error) => this.fail(error)
    });
  }

  confirmReceipt(): void {
    const receipt = this.selectedReceipt();
    if (!receipt || !this.receiptConfirmStoreId) {
      return;
    }

    const lines = receipt.lines.filter((line) => line.productName.trim() && line.variantName.trim() && line.quantity > 0 && line.totalPrice > 0);
    if (lines.length === 0) {
      this.message.set('Agrega al menos un producto con presentacion, cantidad y precio antes de confirmar.');
      return;
    }

    this.api.post<ReceiptImportSummary>(`shopping/receipt-imports/${receipt.id}/confirm`, {
      storeId: this.receiptConfirmStoreId,
      lines
    }).subscribe({
      next: () => {
        this.selectedReceipt.set(null);
        this.receiptConfirmStoreId = null;
        this.reloadAll();
      },
      error: (error) => this.fail(error)
    });
  }

  addReceiptLine(receipt = this.selectedReceipt()): void {
    if (!receipt) {
      return;
    }

    receipt.lines = [
      ...receipt.lines,
      {
        id: `draft-${Date.now()}`,
        productName: '',
        variantName: '',
        quantity: 1,
        unit: 'Unit',
        totalPrice: 1,
        unitPrice: 1,
        productVariantId: null
      }
    ];
    this.selectedReceipt.set({ ...receipt });
  }

  removeReceiptLine(receipt: ReceiptImportSummary, index: number): void {
    receipt.lines = receipt.lines.filter((_, currentIndex) => currentIndex !== index);
    this.selectedReceipt.set({ ...receipt });
  }

  selectReceipt(receipt: ReceiptImportSummary): void {
    this.selectedReceipt.set({ ...receipt, lines: [...receipt.lines] });
    this.receiptConfirmStoreId = receipt.storeId ?? this.findStoreId(receipt.detectedStoreName) ?? null;
    this.message.set(null);
  }

  syncItemUnit(item: DraftListItem): void {
    const variant = this.variants().find((entry) => entry.id === item.productVariantId);
    if (variant) {
      item.unit = variant.unit;
      item.desiredQuantity = variant.normalizedQuantity;
    }
  }

  private loadProducts(): void {
    this.api.get<ProductSummary[]>('shopping/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadVariants();
      },
      error: (error) => this.fail(error)
    });
  }

  private loadVariants(): void {
    this.api.get<ProductVariantSummary[]>('shopping/variants').subscribe({
      next: (variants) => {
        this.variants.set(variants);
        this.loadPrices();
      },
      error: (error) => this.fail(error)
    });
  }

  private loadPrices(): void {
    this.api.get<StoreProductPriceSummary[]>('shopping/prices').subscribe({
      next: (prices) => {
        this.prices.set(prices);
        this.loadReceipts();
      },
      error: (error) => this.fail(error)
    });
  }

  private loadReceipts(): void {
    this.api.get<ReceiptImportSummary[]>('shopping/receipt-imports').subscribe({
      next: (receipts) => {
        this.receipts.set(receipts);
        this.loadLists();
      },
      error: (error) => this.fail(error)
    });
  }

  private loadLists(afterLoad?: () => void): void {
    this.api.get<ShoppingListSummary[]>('shopping/lists').subscribe({
      next: (lists) => {
        this.lists.set(lists);
        this.loading.set(false);
        afterLoad?.();
      },
      error: (error) => this.fail(error)
    });
  }

  private findStoreId(storeName?: string | null): Id | undefined {
    if (!storeName) {
      return undefined;
    }

    return this.stores().find((store) => store.name.toLowerCase() === storeName.toLowerCase())?.id;
  }

  private todayForInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private fail(error: unknown): void {
    this.loading.set(false);
    this.message.set(error instanceof Error ? error.message : 'No se pudo completar la accion.');
  }
}
