import { ResourceDefinition } from './resource.types';

export const RESOURCE_DEFINITIONS: Record<string, ResourceDefinition> = {
  accounts: {
    key: 'accounts',
    title: 'Cuentas',
    subtitle: 'Bancos, efectivo, proveedores y saldos disponibles.',
    icon: 'pi pi-wallet',
    path: 'accounts',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'accountType', label: 'Tipo', type: 'select', required: true, options: ['Bank', 'Cash', 'DigitalWallet', 'Crypto'], table: true },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR', 'BTC', 'ETH'], table: true },
      { key: 'balance', label: 'Balance', type: 'currency', table: true },
      { key: 'bankName', label: 'Banco', type: 'text', table: true },
      { key: 'accountNumber', label: 'Numero de cuenta', type: 'text', table: true },
      { key: 'provider', label: 'Proveedor', type: 'text', table: true },
      {
        key: 'cryptoSymbol',
        label: 'Simbolo cripto',
        type: 'select',
        options: ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC'],
        visibleWhen: { key: 'accountType', value: 'Crypto' }
      },
      {
        key: 'cryptoNetwork',
        label: 'Red cripto',
        type: 'select',
        options: ['Bitcoin', 'Ethereum', 'Solana', 'BNB Smart Chain', 'Polygon', 'Tron', 'Arbitrum', 'Optimism'],
        visibleWhen: { key: 'accountType', value: 'Crypto' }
      },
      { key: 'cryptoQuantity', label: 'Cantidad cripto', type: 'number', visibleWhen: { key: 'accountType', value: 'Crypto' } },
      { key: 'cryptoAvgBuyPriceUsd', label: 'Precio promedio USD', type: 'currency', visibleWhen: { key: 'accountType', value: 'Crypto' } },
      { key: 'isActive', label: 'Activa', type: 'boolean', table: true }
    ]
  },
  transactions: {
    key: 'transactions',
    title: 'Transacciones',
    subtitle: 'Ingresos, gastos y transferencias con categorias y etiquetas.',
    icon: 'pi pi-arrow-right-arrow-left',
    path: 'transactions',
    filter: { key: 'accountId', label: 'Cuenta', placeholder: 'Filtrar por accountId' },
    fields: [
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Income', 'Expense', 'Transfer'], table: true },
      { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR', 'BTC', 'ETH'], table: true },
      { key: 'accountId', label: 'Cuenta origen', type: 'select', required: true, table: true },
      { key: 'toAccountId', label: 'Cuenta destino', type: 'select', visibleWhen: { key: 'type', value: 'Transfer' } },
      { key: 'categoryId', label: 'Categoria', type: 'select', table: true },
      { key: 'description', label: 'Descripcion', type: 'textarea', table: true },
      { key: 'reference', label: 'Referencia', type: 'text' },
      { key: 'transactionDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
      { key: 'recurringRuleId', label: 'Regla recurrente', type: 'text' },
      { key: 'tagIds', label: 'Tags', type: 'multiselect' }
    ]
  },
  budgets: {
    key: 'budgets',
    title: 'Presupuestos',
    subtitle: 'Limites por categoria y periodo.',
    icon: 'pi pi-chart-pie',
    path: 'budgets',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'categoryId', label: 'Categoria', type: 'text', required: true, table: true },
      { key: 'limitAmount', label: 'Limite', type: 'currency', required: true, table: true },
      { key: 'periodType', label: 'Periodo', type: 'select', required: true, options: ['Monthly', 'Quarterly', 'Yearly'], table: true },
      { key: 'validityType', label: 'Vigencia', type: 'select', required: true, options: ['Indefinite', 'Fixed'], table: true },
      { key: 'periodStart', label: 'Inicio', type: 'date' },
      { key: 'periodEnd', label: 'Fin', type: 'date' },
      { key: 'isActive', label: 'Activo', type: 'boolean', table: true }
    ]
  },
  categories: {
    key: 'categories',
    title: 'Categorias',
    subtitle: 'Catalogo para clasificar ingresos y gastos.',
    icon: 'pi pi-sitemap',
    path: 'categories',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Income', 'Expense', 'Transfer'], table: true },
      { key: 'icon', label: 'Icono', type: 'text', table: true },
      { key: 'parentId', label: 'Categoria padre', type: 'text' },
      { key: 'isSystem', label: 'Sistema', type: 'boolean', table: true }
    ]
  },
  tags: {
    key: 'tags',
    title: 'Tags',
    subtitle: 'Etiquetas visuales para agrupar movimientos.',
    icon: 'pi pi-tags',
    path: 'tags',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'color', label: 'Color', type: 'color', required: true, table: true }
    ]
  },
  savingGoals: {
    key: 'savingGoals',
    title: 'Metas De Ahorro',
    subtitle: 'Objetivos, avance y aportes de ahorro.',
    icon: 'pi pi-flag',
    path: 'saving-goals',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'targetAmount', label: 'Meta', type: 'currency', required: true, table: true },
      { key: 'accountId', label: 'Cuenta asociada', type: 'select', required: true, table: true },
      { key: 'targetDate', label: 'Fecha objetivo', type: 'date', required: true, table: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['InProgress', 'Completed', 'Cancelled'], table: true }
    ],
    children: [
      {
        title: 'Aportes de ahorro',
        listPath: 'saving-goal-contributions',
        createPath: 'saving-goals/{id}/contributions',
        updatePath: 'saving-goal-contributions/{id}',
        deletePath: 'saving-goal-contributions/{id}',
        queryParam: 'goalId',
        parentParam: 'savingGoalId',
        fields: [
          { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
          { key: 'accountId', label: 'Cuenta a debitar', type: 'select', required: true, table: true },
          { key: 'contributionDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
          { key: 'transactionId', label: 'Transaccion', type: 'text', table: true, readonly: true }
        ]
      }
    ]
  },
  purchaseGoals: {
    key: 'purchaseGoals',
    title: 'Metas De Compra',
    subtitle: 'Compras planificadas, prioridad y aportes.',
    icon: 'pi pi-shopping-bag',
    path: 'purchase-goals',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'targetPrice', label: 'Precio objetivo', type: 'currency', required: true, table: true },
      { key: 'description', label: 'Descripcion', type: 'textarea', table: true },
      { key: 'priority', label: 'Prioridad', type: 'number', table: true },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'accountId', label: 'Cuenta asociada', type: 'select', required: true, table: true },
      { key: 'targetDate', label: 'Fecha objetivo', type: 'date', required: true, table: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['Saving', 'Completed', 'Cancelled'], table: true },
      { key: 'purchasedAt', label: 'Comprado en', type: 'date' }
    ],
    children: [
      {
        title: 'Aportes de compra',
        listPath: 'purchase-goal-contributions',
        createPath: 'purchase-goals/{id}/contributions',
        updatePath: 'purchase-goal-contributions/{id}',
        deletePath: 'purchase-goal-contributions/{id}',
        queryParam: 'purchaseGoalId',
        parentParam: 'purchaseGoalId',
        fields: [
          { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
          { key: 'accountId', label: 'Cuenta a debitar', type: 'select', required: true, table: true },
          { key: 'contributionDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
          { key: 'transactionId', label: 'Transaccion', type: 'text', table: true, readonly: true }
        ]
      }
    ]
  },
  debts: {
    key: 'debts',
    title: 'Deudas',
    subtitle: 'Cuentas por pagar o cobrar y sus abonos.',
    icon: 'pi pi-credit-card',
    path: 'debts',
    fields: [
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Payable', 'Receivable'], table: true },
      { key: 'contactName', label: 'Contacto', type: 'text', required: true, table: true },
      { key: 'originalAmount', label: 'Monto original', type: 'currency', required: true, table: true },
      { key: 'remainingAmount', label: 'Pendiente', type: 'currency', required: true, table: true },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR'], table: true },
      { key: 'dueDate', label: 'Vence', type: 'date', required: true, table: true },
      { key: 'accountId', label: 'Cuenta', type: 'text', required: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['Active', 'Paid', 'Cancelled'], table: true },
      { key: 'notes', label: 'Notas', type: 'textarea' }
    ],
    children: [
      {
        title: 'Pagos',
        listPath: 'debt-payments',
        createPath: 'debts/{id}/payments',
        updatePath: 'debt-payments/{id}',
        deletePath: 'debt-payments/{id}',
        queryParam: 'debtId',
        parentParam: 'debtId',
        fields: [
          { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
          { key: 'paymentDate', label: 'Fecha', type: 'date', required: true, table: true },
          { key: 'notes', label: 'Notas', type: 'textarea', table: true },
          { key: 'transactionId', label: 'Transaccion', type: 'text' }
        ]
      }
    ]
  },
  cryptoAccounts: {
    key: 'cryptoAccounts',
    title: 'Cuentas Cripto',
    subtitle: 'Posiciones cripto vinculadas a cuentas financieras.',
    icon: 'pi pi-bitcoin',
    path: 'crypto-accounts',
    filter: { key: 'accountId', label: 'Cuenta', placeholder: 'Filtrar por accountId' },
    fields: [
      { key: 'accountId', label: 'Cuenta', type: 'text', required: true, table: true },
      { key: 'symbol', label: 'Simbolo', type: 'text', required: true, table: true },
      { key: 'network', label: 'Red', type: 'text', required: true, table: true },
      { key: 'quantity', label: 'Cantidad', type: 'number', required: true, table: true },
      { key: 'avgBuyPriceUsd', label: 'Promedio USD', type: 'currency', required: true, table: true }
    ]
  },
  cryptoLots: {
    key: 'cryptoLots',
    title: 'Lotes Cripto',
    subtitle: 'Compras, ventas y estado de lotes cripto.',
    icon: 'pi pi-database',
    path: 'crypto-lots',
    filter: { key: 'accountId', label: 'Cuenta', placeholder: 'Filtrar por accountId' },
    fields: [
      { key: 'accountId', label: 'Cuenta', type: 'text', required: true, table: true },
      { key: 'quantity', label: 'Cantidad', type: 'number', required: true, table: true },
      { key: 'buyPriceUsd', label: 'Compra USD', type: 'currency', required: true, table: true },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: ['Open', 'Closed'], table: true },
      { key: 'transactionId', label: 'Transaccion', type: 'text' },
      { key: 'sellPriceUsd', label: 'Venta USD', type: 'currency', table: true },
      { key: 'operationDate', label: 'Fecha', type: 'date', required: true, table: true }
    ]
  },
  accountingPeriods: {
    key: 'accountingPeriods',
    title: 'Periodos Contables',
    subtitle: 'Apertura, cierre y resumen de periodos.',
    icon: 'pi pi-calendar-clock',
    path: 'accounting-periods',
    query: { status: 'Open' },
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'startDate', label: 'Inicio', type: 'date', required: true, table: true },
      { key: 'endDate', label: 'Fin', type: 'date', required: true, table: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['Open', 'Closed'], table: true },
      { key: 'totalIncome', label: 'Ingresos', type: 'currency', table: true },
      { key: 'totalExpenses', label: 'Gastos', type: 'currency', table: true },
      { key: 'netBalance', label: 'Neto', type: 'currency', table: true },
      { key: 'closedAt', label: 'Cerrado en', type: 'date' }
    ]
  },
  recurringRules: {
    key: 'recurringRules',
    title: 'Reglas Recurrentes',
    subtitle: 'Movimientos periodicos automatizables.',
    icon: 'pi pi-refresh',
    path: 'recurring-rules',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Income', 'Expense', 'Transfer'], table: true },
      { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
      { key: 'accountId', label: 'Cuenta', type: 'text', required: true, table: true },
      { key: 'categoryId', label: 'Categoria', type: 'text', required: true },
      { key: 'frequency', label: 'Frecuencia', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Yearly'], table: true },
      { key: 'startDate', label: 'Inicio', type: 'date', required: true },
      { key: 'endDate', label: 'Fin', type: 'date' },
      { key: 'nextDueDate', label: 'Proximo vencimiento', type: 'date', required: true, table: true },
      { key: 'isActive', label: 'Activa', type: 'boolean', table: true }
    ]
  },
  userContext: {
    key: 'userContext',
    title: 'Contexto De Usuario',
    subtitle: 'Preferencias y valores persistidos por clave.',
    icon: 'pi pi-sliders-h',
    path: 'user-context',
    idKey: 'key',
    canCreate: false,
    fields: [
      { key: 'key', label: 'Clave', type: 'text', readonly: true, table: true },
      { key: 'contextKey', label: 'Context key', type: 'text', table: true },
      { key: 'value', label: 'Valor', type: 'textarea', required: true, table: true }
    ]
  }
};

export const CRYPTO_TABS = [RESOURCE_DEFINITIONS['cryptoAccounts'], RESOURCE_DEFINITIONS['cryptoLots']];
