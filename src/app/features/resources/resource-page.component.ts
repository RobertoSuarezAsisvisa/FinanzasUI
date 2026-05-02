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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';

import { ApiService, QueryParams } from '../../core/api/api.service';
import { ResourceChild, ResourceDefinition, ResourceField, ResourceOption } from '../../core/resource/resource.types';
import { ConfirmDeleteService } from '../../shared/confirm-delete/confirm-delete.service';
import { MoneyCellComponent } from '../../shared/money-cell/money-cell.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusTagComponent } from '../../shared/status-tag/status-tag.component';

type Entity = Record<string, any>;

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
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
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
      this.buildForm();
      this.load();
    });
  }

  load(): void {
    const query: QueryParams = { ...(this.definition.query ?? {}) };

    if (this.definition.filter && this.filterValue) {
      query[this.definition.filter.key] = this.filterValue;
    }

    this.loading.set(true);
    this.api.get<Entity[]>(this.definition.path, query).subscribe({
      next: (response) => {
        this.items.set(this.normalizeList(response));
        this.loading.set(false);
      },
      error: (error) => this.fail(error, 'No se pudo cargar la informacion.', () => this.loading.set(false))
    });
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

  private buildForm(item?: Entity): void {
    this.form = this.createForm(this.definition.fields, item);
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
      return value ? new Date(String(value)) : null;
    }

    if (field.type === 'tags') {
      return Array.isArray(value) ? value.join(',') : '';
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
      const firstArray = Object.values(object).find(Array.isArray);
      return (firstArray as Entity[]) ?? [];
    }

    return [];
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
