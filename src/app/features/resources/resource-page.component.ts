import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';

import { ApiService, QueryParams } from '../../core/api/api.service';
import { ResourceChild, ResourceDefinition, ResourceField, ResourceOption } from '../../core/resource/resource.types';
import { ConfirmDeleteService } from '../../shared/confirm-delete/confirm-delete.service';
import { MoneyCellComponent } from '../../shared/money-cell/money-cell.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusTagComponent } from '../../shared/status-tag/status-tag.component';

type Entity = Record<string, any>;
type ActionSummaryItem = { label: string; value: string; severity?: 'default' | 'success' | 'warning' };

@Component({
  selector: 'app-resource-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    MoneyCellComponent,
    StatusTagComponent,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    ColorPickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    ToggleSwitchModule,
    ToolbarModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './resource-page.component.html',
  styleUrl: './resource-page.component.scss'
})
export class ResourcePageComponent implements OnInit {
  definition!: ResourceDefinition;
  items = signal<Entity[]>([]);
  childItems = signal<Entity[]>([]);
  loading = signal(false);
  childLoading = signal(false);
  dialogVisible = false;
  childDialogVisible = false;
  editingItem: Entity | null = null;
  editingChildItem: Entity | null = null;
  selectedParent: Entity | null = null;
  activeChild: ResourceChild | null = null;
  filterValue = '';
  transactionFilters: Entity = {};
  transactionFirst = 0;
  transactionRows = 10;
  totalRecords = signal(0);
  dynamicOptions: Record<string, ResourceOption[]> = {};
  form = new FormGroup({});
  childForm = new FormGroup({});

  tableFields = computed(() => this.definition.fields.filter((field) => field.table));
  childTableFields = computed(() => this.activeChild?.fields.filter((field) => field.table) ?? []);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly messages: MessageService,
    private readonly confirmDelete: ConfirmDeleteService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.definition = data['resource'];
      this.selectedParent = null;
      this.activeChild = null;
      this.filterValue = '';
      this.transactionFilters = {};
      this.transactionFirst = 0;
      this.transactionRows = 10;
      this.totalRecords.set(0);
      this.dynamicOptions = {};
      this.buildForm();
      this.loadLookupOptions();
      this.load();
    });
  }

  load(resetPage = true): void {
    if (this.isTransactionsResource() && resetPage) {
      this.transactionFirst = 0;
    }

    const query: QueryParams = { ...(this.definition.query ?? {}) };

    if (this.definition.filter && this.filterValue) {
      query[this.definition.filter.key] = this.filterValue;
    }

    if (this.isTransactionsResource()) {
      query['page'] = Math.floor(this.transactionFirst / this.transactionRows) + 1;
      query['pageSize'] = this.transactionRows;

      Object.entries(this.transactionFilters).forEach(([key, value]) => {
        if (value instanceof Date) {
          const dateValue = new Date(value);
          if (key === 'dateTo') {
            dateValue.setHours(23, 59, 59, 999);
          }
          query[key] = dateValue.toISOString();
        } else if (value !== null && value !== undefined && value !== '') {
          query[key] = value;
        }
      });
    }

    this.loading.set(true);
    this.api.get<unknown>(this.definition.path, query).subscribe({
      next: (response) => {
        this.items.set(this.normalizeList(response));
        this.totalRecords.set(this.totalCount(response));
        this.loading.set(false);
      },
      error: (error) => this.fail(error, 'No se pudo cargar la informacion.', () => this.loading.set(false))
    });
  }

  loadLazy(event: { first?: number | null; rows?: number | null }): void {
    if (!this.isTransactionsResource()) {
      return;
    }

    this.transactionFirst = event.first ?? 0;
    this.transactionRows = event.rows ?? this.transactionRows;
    this.load(false);
  }

  openCreate(): void {
    this.editingItem = null;
    this.buildForm();
    this.dialogVisible = true;
    this.cdr.detectChanges();
  }

  openEdit(item: Entity): void {
    this.editingItem = item;
    this.buildForm(item);
    this.dialogVisible = true;
    this.cdr.detectChanges();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.payload(this.definition.fields, this.form);
    const request = this.editingItem
      ? this.api.put<Entity>(`${this.definition.path}/${this.itemId(this.editingItem)}`, payload)
      : this.api.post<Entity>(this.definition.path, payload);

    request.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.messages.add({ severity: 'success', summary: 'Guardado', detail: `${this.definition.title} actualizado.` });
        this.load();
      },
      error: (error) => this.fail(error, 'No se pudo guardar el registro.')
    });
  }

  remove(item: Entity): void {
    this.confirmDelete.ask(this.displayName(item), () => {
      this.api.delete<void>(`${this.definition.path}/${this.itemId(item)}`).subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Eliminado', detail: `${this.definition.title} actualizado.` });
          this.load();
        },
        error: (error) => this.fail(error, 'No se pudo eliminar el registro.')
      });
    });
  }

  selectParent(item: Entity): void {
    if (!this.definition.children?.length) {
      return;
    }

    this.selectedParent = item;
    this.activeChild = this.definition.children[0];
    this.buildChildForm();
    this.loadChildren();
  }

  loadChildren(): void {
    if (!this.selectedParent || !this.activeChild) {
      return;
    }

    this.childLoading.set(true);
    this.api
      .get<Entity[]>(this.activeChild.listPath, { [this.activeChild.queryParam]: this.itemId(this.selectedParent) })
      .subscribe({
        next: (response) => {
          this.childItems.set(this.normalizeList(response));
          this.childLoading.set(false);
        },
        error: (error) => this.fail(error, 'No se pudo cargar el detalle.', () => this.childLoading.set(false))
      });
  }

  openChildCreate(): void {
    this.editingChildItem = null;
    this.buildChildForm();
    this.childDialogVisible = true;
    this.cdr.detectChanges();
  }

  openChildEdit(item: Entity): void {
    this.editingChildItem = item;
    this.buildChildForm(item);
    this.childDialogVisible = true;
    this.cdr.detectChanges();
  }

  saveChild(): void {
    if (!this.activeChild || !this.selectedParent || this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    const payload = this.payload(this.activeChild.fields, this.childForm);
    const parentId = this.itemId(this.selectedParent);
    const path = this.editingChildItem
      ? this.activeChild.updatePath.replace('{id}', this.itemId(this.editingChildItem))
      : this.activeChild.createPath.replace('{id}', parentId);

    const request = this.editingChildItem ? this.api.put<Entity>(path, payload) : this.api.post<Entity>(path, payload);

    request.subscribe({
      next: () => {
        this.childDialogVisible = false;
        this.messages.add({ severity: 'success', summary: 'Guardado', detail: `${this.activeChild?.title} actualizado.` });
        this.loadChildren();
        this.load();
      },
      error: (error) => this.fail(error, 'No se pudo guardar el detalle.')
    });
  }

  removeChild(item: Entity): void {
    if (!this.activeChild) {
      return;
    }

    this.confirmDelete.ask(this.displayName(item), () => {
      const path = this.activeChild!.deletePath.replace('{id}', this.itemId(item));
      this.api.delete<void>(path).subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Eliminado', detail: `${this.activeChild?.title} actualizado.` });
          this.loadChildren();
          this.load();
        },
        error: (error) => this.fail(error, 'No se pudo eliminar el detalle.')
      });
    });
  }

  isInvalid(field: ResourceField, child = false): boolean {
    const control = child ? this.childForm.get(field.key) : this.form.get(field.key);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  displayValue(item: Entity, field: ResourceField): unknown {
    const value = item[field.key];

    if (field.key === 'accountId' || field.key === 'toAccountId' || field.key === 'categoryId') {
      return this.optionLabel(field.key, value) ?? '-';
    }

    if (field.key === 'tagIds') {
      return Array.isArray(value) && value.length
        ? value.map((tagId) => this.optionLabel('tagIds', tagId) ?? tagId).join(', ')
        : '-';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value ?? '-';
  }

  showCreate(): boolean {
    return this.definition.canCreate !== false;
  }

  visibleFields(fields = this.definition.fields, form = this.form): ResourceField[] {
    return fields.filter((field) => this.isFieldVisible(field, form));
  }

  isFieldVisible(field: ResourceField, form = this.form): boolean {
    if (!field.visibleWhen) {
      return true;
    }

    return form.get(field.visibleWhen.key)?.value === field.visibleWhen.value;
  }

  selectOptions(field: ResourceField): ResourceOption[] {
    if (this.dynamicOptions[field.key]) {
      return this.dynamicOptions[field.key];
    }

    return (field.options ?? []).map((option) => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }

      return option;
    });
  }

  isCryptoAccountForm(): boolean {
    return this.definition.key === 'accounts' && this.form.get('accountType')?.value === 'Crypto';
  }

  isAccountsResource(): boolean {
    return this.definition.key === 'accounts';
  }

  isTransactionsResource(): boolean {
    return this.definition.key === 'transactions';
  }

  isSavingGoalsResource(): boolean {
    return this.definition.key === 'savingGoals';
  }

  transactionCoreFields(): ResourceField[] {
    return this.transactionFields(['type', 'amount', 'currency', 'transactionDate']);
  }

  transactionAccountFields(): ResourceField[] {
    return this.transactionFields(['accountId', 'toAccountId', 'categoryId']);
  }

  transactionDetailFields(): ResourceField[] {
    return this.transactionFields(['description', 'reference', 'recurringRuleId', 'tagIds']);
  }

  clearTransactionFilters(): void {
    this.transactionFilters = {};
    this.load();
  }

  accountPrimaryFields(): ResourceField[] {
    return this.accountFields(['name', 'accountType', 'currency', 'balance']);
  }

  accountInstitutionFields(): ResourceField[] {
    return this.accountFields(['bankName', 'accountNumber', 'provider']);
  }

  accountCryptoFields(): ResourceField[] {
    return this.accountFields(['cryptoSymbol', 'cryptoNetwork', 'cryptoQuantity', 'cryptoAvgBuyPriceUsd']);
  }

  accountStateFields(): ResourceField[] {
    return this.accountFields(['isActive']);
  }

  accountBalanceHint(field: ResourceField, child = false): string | null {
    if (field.key !== 'accountId') {
      return null;
    }

    const control = child ? this.childForm.get(field.key) : this.form.get(field.key);
    const option = this.dynamicOptions[field.key]?.find((entry) => entry.value === String(control?.value ?? ''));
    if (!option || option.balance === undefined) {
      return null;
    }

    return `Saldo disponible: ${this.formatMoney(option.balance, option.currency ?? 'USD')}`;
  }

  showContributionActionSummary(): boolean {
    return !!this.activeChild
      && !!this.selectedParent
      && (this.definition.key === 'savingGoals' || this.definition.key === 'purchaseGoals')
      && this.childForm.contains('amount')
      && this.childForm.contains('accountId');
  }

  contributionActionSummary(): ActionSummaryItem[] {
    if (!this.showContributionActionSummary()) {
      return [];
    }

    const amount = Number(this.childForm.get('amount')?.value ?? 0);
    const sourceAccountId = String(this.childForm.get('accountId')?.value ?? '');
    const targetAccountId = this.selectedParent?.['accountId'] ? String(this.selectedParent['accountId']) : '';
    const sourceAccount = this.accountOption(sourceAccountId);
    const targetAccount = this.accountOption(targetAccountId);
    const currency = sourceAccount?.currency ?? targetAccount?.currency ?? 'USD';
    const goalName = String(this.selectedParent?.['name'] ?? 'objetivo');
    const isTransfer = !!targetAccountId && targetAccountId !== sourceAccountId;
    const estimatedBalance = sourceAccount?.balance !== undefined ? sourceAccount.balance - amount : null;
    const summary: ActionSummaryItem[] = [];

    if (amount > 0 && sourceAccount) {
      summary.push({
        label: 'Debito',
        value: `Se descontará ${this.formatMoney(amount, currency)} de ${sourceAccount.label}.`,
        severity: estimatedBalance !== null && estimatedBalance < 0 ? 'warning' : 'default'
      });
    } else {
      summary.push({
        label: 'Debito',
        value: 'Selecciona monto y cuenta para calcular el movimiento.',
        severity: 'warning'
      });
    }

    summary.push({
      label: 'Transaccion',
      value: isTransfer && targetAccount
        ? `Se creará una transferencia automática hacia ${targetAccount.label}.`
        : 'Se creará una transacción automática de gasto para respaldar el aporte.'
    });

    if (amount > 0) {
      summary.push({
        label: 'Objetivo',
        value: `El avance de "${goalName}" aumentará en ${this.formatMoney(amount, currency)}.`,
        severity: 'success'
      });
    }

    if (estimatedBalance !== null) {
      summary.push({
        label: 'Saldo estimado',
        value: `${sourceAccount?.label}: ${this.formatMoney(estimatedBalance, currency)}.`,
        severity: estimatedBalance < 0 ? 'warning' : 'default'
      });
    }

    if (this.editingChildItem) {
      summary.push({
        label: 'Edicion',
        value: 'Se recalculará la transacción existente y el avance acumulado del objetivo.'
      });
    }

    return summary;
  }

  toggleAccountActive(item: Entity, checked: boolean): void {
    if (!this.isAccountsResource()) {
      return;
    }

    const payload = this.definition.fields.reduce<Entity>((body, field) => {
      if (!field.readonly) {
        body[field.key] = field.key === 'isActive' ? checked : (item[field.key] ?? null);
      }

      return body;
    }, {});

    this.api.put<Entity>(`${this.definition.path}/${this.itemId(item)}`, payload).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: checked ? 'Cuenta activada' : 'Cuenta desactivada',
          detail: String(item['name'] ?? 'Cuenta actualizada')
        });
        this.load();
      },
      error: (error) => {
        item['isActive'] = !checked;
        this.fail(error, 'No se pudo actualizar la cuenta.');
      }
    });
  }

  private buildForm(item?: Entity): void {
    this.form = this.createForm(this.definition.fields, item);
  }

  private accountFields(keys: string[]): ResourceField[] {
    return keys
      .map((key) => this.definition.fields.find((field) => field.key === key))
      .filter((field): field is ResourceField => !!field)
      .filter((field) => this.isFieldVisible(field));
  }

  private transactionFields(keys: string[]): ResourceField[] {
    return keys
      .map((key) => this.definition.fields.find((field) => field.key === key))
      .filter((field): field is ResourceField => !!field)
      .filter((field) => this.isFieldVisible(field));
  }

  private buildChildForm(item?: Entity): void {
    this.childForm = this.createForm(this.activeChild?.fields ?? [], item);
  }

  private createForm(fields: ResourceField[], item?: Entity): FormGroup {
    const group: Record<string, FormControl> = {};

    fields
      .filter((field) => !field.readonly)
      .forEach((field) => {
        const validators = [];
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.type === 'number' || field.type === 'currency') {
          validators.push(Validators.min(0));
        }

        group[field.key] = new FormControl(this.initialValue(field, item?.[field.key]), validators);
      });

    return new FormGroup(group);
  }

  private initialValue(field: ResourceField, value: unknown): unknown {
    if (field.type === 'boolean') {
      return value ?? true;
    }

    if (field.type === 'date') {
      if (!value && field.defaultNow) {
        return new Date();
      }

      return value ? new Date(String(value)) : null;
    }

    if (field.type === 'tags') {
      return Array.isArray(value) ? value.join(',') : '';
    }

    if (field.type === 'multiselect') {
      return Array.isArray(value) ? value : [];
    }

    return value ?? null;
  }

  private payload(fields: ResourceField[], form: FormGroup): Entity {
    return fields.reduce<Entity>((body, field) => {
      if (field.readonly || !form.contains(field.key)) {
        return body;
      }

      if (!this.isFieldVisible(field, form)) {
        body[field.key] = null;
        return body;
      }

      const value = form.get(field.key)?.value;

      if (value === '') {
        body[field.key] = null;
      } else if (field.type === 'date') {
        body[field.key] = value instanceof Date ? value.toISOString() : value;
      } else if (field.type === 'tags') {
        body[field.key] = String(value ?? '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean);
      } else if (field.type === 'multiselect') {
        body[field.key] = Array.isArray(value) ? value : [];
      } else {
        body[field.key] = value;
      }

      return body;
    }, {});
  }

  private itemId(item: Entity): string {
    const key = this.definition.idKey ?? 'id';
    return String(item[key] ?? item['id'] ?? item['contextKey']);
  }

  private displayName(item: Entity): string {
    return String(item['name'] ?? item['contactName'] ?? item['key'] ?? item['id'] ?? 'registro');
  }

  private normalizeList(response: unknown): Entity[] {
    if (Array.isArray(response)) {
      return response as Entity[];
    }

    if (response && typeof response === 'object') {
      const object = response as Record<string, unknown>;
      if (Array.isArray(object['items'])) {
        return object['items'] as Entity[];
      }

      const firstArray = Object.values(object).find(Array.isArray);
      return (firstArray as Entity[]) ?? [];
    }

    return [];
  }

  private totalCount(response: unknown): number {
    if (response && typeof response === 'object') {
      const object = response as Record<string, unknown>;
      const totalCount = object['totalCount'];

      if (typeof totalCount === 'number') {
        return totalCount;
      }
    }

    return this.normalizeList(response).length;
  }

  private loadLookupOptions(): void {
    if (!this.usesAccountLookup() && !this.isTransactionsResource()) {
      return;
    }

    this.api.get<Entity[]>('accounts').subscribe({
      next: (accounts) => {
        const options = this.normalizeList(accounts).map((account) => ({
          label: `${account['name']} - ${this.formatMoney(Number(account['balance'] ?? 0), String(account['currency'] ?? 'USD'))}`,
          value: String(account['id']),
          balance: Number(account['balance'] ?? 0),
          currency: String(account['currency'] ?? 'USD')
        }));
        this.dynamicOptions['accountId'] = options;
        this.dynamicOptions['toAccountId'] = options;
      },
      error: () => undefined
    });

    if (!this.isTransactionsResource()) {
      return;
    }

    this.loadTransactionLookups();
  }

  private optionLabel(fieldKey: string, value: unknown): string | null {
    if (!value) {
      return null;
    }

    return this.dynamicOptions[fieldKey]?.find((option) => option.value === String(value))?.label ?? null;
  }

  private accountOption(accountId: string): ResourceOption | null {
    if (!accountId) {
      return null;
    }

    return this.dynamicOptions['accountId']?.find((option) => option.value === accountId) ?? null;
  }

  private usesAccountLookup(): boolean {
    const childFields = this.definition.children?.flatMap((child) => child.fields) ?? [];
    return [...this.definition.fields, ...childFields].some((field) => field.key === 'accountId' && field.type === 'select');
  }

  private loadTransactionLookups(): void {
    this.api.get<Entity[]>('categories').subscribe({
      next: (categories) => {
        this.dynamicOptions['categoryId'] = this.normalizeList(categories).map((category) => ({
          label: String(category['name']),
          value: String(category['id'])
        }));
      },
      error: () => undefined
    });

    this.api.get<Entity[]>('tags').subscribe({
      next: (tags) => {
        this.dynamicOptions['tagIds'] = this.normalizeList(tags).map((tag) => ({
          label: String(tag['name']),
          value: String(tag['id'])
        }));
      },
      error: () => undefined
    });
  }

  private formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(value);
  }

  private fail(error: Error, fallback: string, done?: () => void): void {
    done?.();
    this.messages.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || fallback
    });
  }
}
