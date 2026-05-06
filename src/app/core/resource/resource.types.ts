export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'select' | 'multiselect' | 'color' | 'boolean' | 'textarea' | 'tags';

export interface ResourceOption {
  label: string;
  value: string;
  balance?: number;
  currency?: string;
  categoryId?: string;
  limitAmount?: number;
  periodType?: string;
  validityType?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  options?: Array<string | ResourceOption>;
  placeholder?: string;
  table?: boolean;
  showTime?: boolean;
  defaultNow?: boolean;
  defaultValue?: unknown;
  visibleWhen?: {
    key: string;
    value: unknown;
  };
}

export interface ResourceChild {
  title: string;
  listPath: string;
  createPath: string;
  updatePath: string;
  deletePath: string;
  queryParam: string;
  parentParam: string;
  fields: ResourceField[];
}

export interface ResourceDefinition {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  idKey?: string;
  canCreate?: boolean;
  query?: Record<string, string>;
  filter?: {
    key: string;
    label: string;
    placeholder: string;
  };
  fields: ResourceField[];
  children?: ResourceChild[];
}
