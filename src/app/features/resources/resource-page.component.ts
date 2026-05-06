import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
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
    ProgressBarModule,
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
  tagFilterValue = '';
  creatingTag = false;
  categoryFilterValue = '';
  creatingCategory = false;
  budgetTransactions: Entity[] = [];
  form = new FormGroup({});
  childForm = new FormGroup({});

  tableFields = computed(() => this.definition.fields.filter((field) => field.table));
  childTableFields = computed(() => this.activeChild?.fields.filter((field) => field.table) ?? []);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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
      this.applyTransactionStateFromUrl();
      this.buildForm();
      this.loadLookupOptions();
      this.load(false);
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
      this.syncTransactionStateToUrl();
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
        this.reloadAfterMutation();
      },
      error: (error) => this.fail(error, 'No se pudo guardar el registro.')
    });
  }

  remove(item: Entity): void {
    this.confirmDelete.ask(this.displayName(item), () => {
      this.api.delete<void>(`${this.definition.path}/${this.itemId(item)}`).subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Eliminado', detail: `${this.definition.title} actualizado.` });
          this.reloadAfterMutation();
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
        this.reloadAfterMutation();
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
          this.reloadAfterMutation();
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

    if (field.key === 'budgetId') {
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
    if (field.key === 'budgetId') {
      return this.filteredBudgetOptions();
    }

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

  selectEmptyMessage(field: ResourceField): string {
    if (field.key === 'categoryId') {
      return 'No existe esa categoria.';
    }

    if (field.key === 'budgetId') {
      return 'No hay presupuestos activos.';
    }

    return 'Sin resultados';
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
    return this.transactionFields(['accountId', 'toAccountId', 'categoryId', 'budgetId']);
  }

  onSelectFieldChange(fieldKey: string, value: unknown): void {
    if (!this.isTransactionsResource()) {
      return;
    }

    if (fieldKey === 'budgetId') {
      return;
    }
  }

  selectedBudgetSummary(): { name: string; limit: number; projectedSpent: number; remaining: number; percent: number } | null {
    if (!this.isTransactionsResource()) {
      return null;
    }

    const budget = this.budgetOption(String(this.form.get('budgetId')?.value ?? ''));
    if (!budget?.limitAmount) {
      return null;
    }

    const amount = Number(this.form.get('amount')?.value ?? 0);
    const currentTransactionId = this.editingItem ? this.itemId(this.editingItem) : null;
    const spent = this.budgetTransactions
      .filter((transaction) => this.transactionBelongsToBudget(transaction, budget))
      .filter((transaction) => !currentTransactionId || String(transaction['id']) !== currentTransactionId)
      .reduce((total, transaction) => total + Number(transaction['amount'] ?? 0), 0);
    const projectedSpent = spent + amount;
    const remaining = budget.limitAmount - projectedSpent;

    return {
      name: budget.label,
      limit: budget.limitAmount,
      projectedSpent,
      remaining,
      percent: budget.limitAmount > 0 ? Math.min(100, (projectedSpent / budget.limitAmount) * 100) : 0
    };
  }

  transactionDetailFields(): ResourceField[] {
    return this.transactionFields(['description', 'tagIds']);
  }

  clearTransactionFilters(): void {
    this.transactionFilters = {};
    this.transactionFirst = 0;
    this.load();
  }

  onTagFilter(event: { filter?: unknown }): void {
    this.tagFilterValue = String(event.filter ?? '').trim();
  }

  clearTagFilter(): void {
    this.tagFilterValue = '';
  }

  onCategoryFilter(event: { filter?: unknown }): void {
    this.categoryFilterValue = String(event.filter ?? '').trim();
  }

  clearCategoryFilter(): void {
    this.categoryFilterValue = '';
  }

  normalizedTagFilter(): string {
    return this.tagFilterValue.trim();
  }

  canCreateTagFromFilter(): boolean {
    const name = this.normalizedTagFilter();

    return !!name && !this.creatingTag && !this.tagExists(name);
  }

  normalizedCategoryFilter(): string {
    return this.categoryFilterValue.trim();
  }

  canCreateCategoryFromFilter(): boolean {
    const name = this.normalizedCategoryFilter();

    return !!name && !this.creatingCategory && !this.categoryExists(name);
  }

  createTagFromFilter(): void {
    const name = this.normalizedTagFilter();
    if (!name || this.tagExists(name) || this.creatingTag) {
      return;
    }

    this.creatingTag = true;
    this.api.post<Entity>('tags', { name, color: this.tagColor(name) }).subscribe({
      next: (tag) => {
        const option = {
          label: String(tag['name']),
          value: String(tag['id'])
        };
        const tagControl = this.form.get('tagIds');
        const selected: string[] = Array.isArray(tagControl?.value) ? [...tagControl.value as string[]] : [];

        this.dynamicOptions['tagIds'] = [...(this.dynamicOptions['tagIds'] ?? []), option].sort((a, b) => a.label.localeCompare(b.label));
        if (!selected.includes(option.value)) {
          selected.push(option.value);
        }
        tagControl?.setValue(selected as never);
        tagControl?.markAsDirty();
        this.tagFilterValue = '';
        this.creatingTag = false;
        this.messages.add({ severity: 'success', summary: 'Tag creado', detail: `"${option.label}" quedó seleccionado.` });
      },
      error: (error) => this.fail(error, 'No se pudo crear el tag.', () => {
        this.creatingTag = false;
      })
    });
  }

  createCategoryFromFilter(): void {
    const name = this.normalizedCategoryFilter();
    if (!name || this.categoryExists(name) || this.creatingCategory) {
      return;
    }

    this.creatingCategory = true;
    this.api.post<Entity>('categories', {
      name,
      type: this.transactionCategoryType(),
      icon: 'pi pi-tag',
      parentId: null,
      isSystem: false
    }).subscribe({
      next: (category) => {
        const option = {
          label: String(category['name']),
          value: String(category['id'])
        };

        this.dynamicOptions['categoryId'] = [...(this.dynamicOptions['categoryId'] ?? []), option].sort((a, b) => a.label.localeCompare(b.label));
        this.form.get('categoryId')?.setValue(option.value as never);
        this.form.get('categoryId')?.markAsDirty();
        this.categoryFilterValue = '';
        this.creatingCategory = false;
        this.messages.add({ severity: 'success', summary: 'Categoria creada', detail: `"${option.label}" quedó seleccionada.` });
      },
      error: (error) => this.fail(error, 'No se pudo crear la categoria.', () => {
        this.creatingCategory = false;
      })
    });
  }

  accountPrimaryFields(): ResourceField[] {
    return this.accountFields(['name', 'accountType', 'purpose', 'currency', 'balance']);
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
      && (this.definition.key === 'savingGoals' || this.definition.key === 'purchaseGoals' || this.definition.key === 'debts')
      && this.childForm.contains('amount')
      && this.childForm.contains('accountId');
  }

  contributionActionSummary(): ActionSummaryItem[] {
    if (!this.showContributionActionSummary()) {
      return [];
    }

    if (this.definition.key === 'debts') {
      return this.debtPaymentActionSummary();
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

  private debtPaymentActionSummary(): ActionSummaryItem[] {
    const amount = Number(this.childForm.get('amount')?.value ?? 0);
    const accountId = String(this.childForm.get('accountId')?.value ?? '');
    const account = this.accountOption(accountId);
    const debtType = String(this.selectedParent?.['type'] ?? '');
    const contactName = String(this.selectedParent?.['contactName'] ?? 'la deuda');
    const currency = account?.currency ?? String(this.selectedParent?.['currency'] ?? 'USD');
    const isPayable = debtType === 'Payable';
    const estimatedBalance = account?.balance !== undefined
      ? account.balance + (isPayable ? -amount : amount)
      : null;
    const remaining = Number(this.selectedParent?.['remainingAmount'] ?? 0);
    const remainingAfterPayment = Math.max(remaining - amount, 0);
    const summary: ActionSummaryItem[] = [];

    if (amount > 0 && account) {
      summary.push({
        label: isPayable ? 'Debito' : 'Ingreso',
        value: isPayable
          ? `Se descontará ${this.formatMoney(amount, currency)} de ${account.label}.`
          : `Ingresarán ${this.formatMoney(amount, currency)} en ${account.label}.`,
        severity: estimatedBalance !== null && estimatedBalance < 0 ? 'warning' : 'default'
      });
    } else {
      summary.push({
        label: 'Movimiento',
        value: 'Selecciona monto y cuenta para calcular el movimiento.',
        severity: 'warning'
      });
    }

    summary.push({
      label: 'Transaccion',
      value: isPayable
        ? `Se creará una transacción automática de gasto para el pago a ${contactName}.`
        : `Se creará una transacción automática de ingreso por el cobro a ${contactName}.`
    });

    if (amount > 0) {
      summary.push({
        label: 'Deuda',
        value: `El saldo pendiente bajará de ${this.formatMoney(remaining, currency)} a ${this.formatMoney(remainingAfterPayment, currency)}.`,
        severity: remainingAfterPayment === 0 ? 'success' : 'default'
      });
    }

    if (estimatedBalance !== null) {
      summary.push({
        label: 'Saldo estimado',
        value: `${account?.label}: ${this.formatMoney(estimatedBalance, currency)}.`,
        severity: estimatedBalance < 0 ? 'warning' : 'default'
      });
    }

    if (this.editingChildItem) {
      summary.push({
        label: 'Edicion',
        value: 'Se recalculará la transacción existente y el saldo pendiente de la deuda.'
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

  private reloadAfterMutation(): void {
    this.load(!this.isTransactionsResource());
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

    if (value === undefined || value === null) {
      if (field.defaultValue !== undefined) {
        return field.defaultValue;
      }
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

    this.api.get<Entity[]>('budgets').subscribe({
      next: (budgets) => {
        this.dynamicOptions['budgetId'] = this.normalizeList(budgets)
          .filter((budget) => budget['isActive'] !== false)
          .map((budget) => ({
            label: `${budget['name']} - ${this.formatMoney(Number(budget['limitAmount'] ?? 0), 'USD')}`,
            value: String(budget['id']),
            categoryId: budget['categoryId'] ? String(budget['categoryId']) : undefined,
            limitAmount: Number(budget['limitAmount'] ?? 0),
            periodType: String(budget['periodType'] ?? ''),
            validityType: String(budget['validityType'] ?? ''),
            periodStart: budget['periodStart'] ? String(budget['periodStart']) : null,
            periodEnd: budget['periodEnd'] ? String(budget['periodEnd']) : null
          }));
      },
      error: () => undefined
    });

    this.api.get<unknown>('transactions', { page: 1, pageSize: 1000 }).subscribe({
      next: (response) => {
        this.budgetTransactions = this.normalizeList(response).filter((transaction) => transaction['type'] === 'Expense');
      },
      error: () => undefined
    });
  }

  private filteredBudgetOptions(): ResourceOption[] {
    return this.dynamicOptions['budgetId'] ?? [];
  }

  private budgetOption(budgetId: string): ResourceOption | null {
    if (!budgetId) {
      return null;
    }

    return this.dynamicOptions['budgetId']?.find((option) => option.value === budgetId) ?? null;
  }

  private transactionBelongsToBudget(transaction: Entity, budget: ResourceOption): boolean {
    if (String(transaction['budgetId'] ?? '') === budget.value) {
      return this.isWithinBudgetPeriod(String(transaction['transactionDate'] ?? ''), budget);
    }

    return false;
  }

  private isWithinBudgetPeriod(transactionDate: string, budget: ResourceOption): boolean {
    if (!transactionDate) {
      return true;
    }

    const date = new Date(transactionDate);
    if (Number.isNaN(date.getTime())) {
      return true;
    }

    if (budget.periodStart && date < new Date(budget.periodStart)) {
      return false;
    }

    if (budget.periodEnd && date > new Date(budget.periodEnd)) {
      return false;
    }

    return true;
  }

  private applyTransactionStateFromUrl(): void {
    if (!this.isTransactionsResource()) {
      return;
    }

    const params = this.route.snapshot.queryParamMap;
    this.transactionRows = this.positiveInt(params.get('pageSize'), 10);
    this.transactionFirst = (this.positiveInt(params.get('page'), 1) - 1) * this.transactionRows;
    this.transactionFilters = {};

    this.applyStringQueryParam(params, 'type');
    this.applyStringQueryParam(params, 'accountId');
    this.applyStringQueryParam(params, 'categoryId');
    this.applyStringQueryParam(params, 'search');
    this.applyDateQueryParam(params, 'dateFrom');
    this.applyDateQueryParam(params, 'dateTo');
  }

  private syncTransactionStateToUrl(): void {
    const page = Math.floor(this.transactionFirst / this.transactionRows) + 1;
    const queryParams: Entity = {};

    if (page > 1) {
      queryParams['page'] = page;
    }

    if (this.transactionRows !== 10) {
      queryParams['pageSize'] = this.transactionRows;
    }

    Object.entries(this.transactionFilters).forEach(([key, value]) => {
      if (value instanceof Date) {
        queryParams[key] = this.dateToQueryParam(value);
      } else if (value !== null && value !== undefined && value !== '') {
        queryParams[key] = value;
      }
    });

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: false
    });
  }

  private applyStringQueryParam(params: ParamMap, key: string): void {
    const value = params.get(key);
    if (value) {
      this.transactionFilters[key] = value;
    }
  }

  private applyDateQueryParam(params: ParamMap, key: string): void {
    const value = params.get(key);
    if (!value) {
      return;
    }

    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      this.transactionFilters[key] = date;
    }
  }

  private positiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private dateToQueryParam(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private tagExists(name: string): boolean {
    const normalizedName = name.trim().toLocaleLowerCase();

    return (this.dynamicOptions['tagIds'] ?? []).some((tag) => tag.label.trim().toLocaleLowerCase() === normalizedName);
  }

  private categoryExists(name: string): boolean {
    const normalizedName = name.trim().toLocaleLowerCase();

    return (this.dynamicOptions['categoryId'] ?? []).some((category) => category.label.trim().toLocaleLowerCase() === normalizedName);
  }

  private transactionCategoryType(): string {
    const type = String(this.form.get('type')?.value ?? 'Expense');

    return ['Income', 'Expense', 'Transfer'].includes(type) ? type : 'Expense';
  }

  private tagColor(name: string): string {
    const palette = ['#16794a', '#227c9d', '#c99213', '#d45454', '#6b5dd3', '#008f7a'];
    const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;

    return palette[index];
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
