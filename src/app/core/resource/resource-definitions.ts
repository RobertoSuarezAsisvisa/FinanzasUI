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
      { key: 'accountType', label: 'Tipo', type: 'select', required: true, options: ['Bank', 'Cash', 'DigitalWallet', 'Crypto', 'CreditCard'], table: true },
      { key: 'purpose', label: 'Uso', type: 'select', required: true, options: ['Spending', 'Savings', 'Investment', 'Reserved'], table: true, defaultValue: 'Spending' },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR', 'BTC', 'ETH'], table: true, defaultValue: 'USD' },
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
      { key: 'creditCardIssuer', label: 'Emisor', type: 'text', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 'Banco Diners Club del Ecuador' },
      { key: 'creditCardBrand', label: 'Marca', type: 'select', options: ['DinersClub', 'Discover', 'Visa', 'Mastercard', 'Other'], visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 'Discover' },
      { key: 'creditCardProductName', label: 'Producto', type: 'text', visibleWhen: { key: 'accountType', value: 'CreditCard' } },
      { key: 'creditCardLastFour', label: 'Ultimos 4', type: 'text', visibleWhen: { key: 'accountType', value: 'CreditCard' } },
      { key: 'creditLimit', label: 'Cupo', type: 'currency', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 500 },
      { key: 'outstandingBalance', label: 'Saldo usado', type: 'currency', readonly: true, table: true },
      { key: 'availableCredit', label: 'Disponible tarjeta', type: 'currency', readonly: true, table: true },
      { key: 'statementClosingDay', label: 'Dia de corte', type: 'number', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 1 },
      { key: 'paymentDueDay', label: 'Dia de pago', type: 'number', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 15 },
      { key: 'paymentMode', label: 'Modo de pago', type: 'select', options: ['Manual', 'AutomaticMinimum', 'AutomaticTotal'], visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 'Manual' },
      { key: 'rewardsProgram', label: 'Recompensas', type: 'text', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 'Miles' },
      { key: 'statementDelivery', label: 'Estado de cuenta', type: 'select', options: ['Virtual', 'Physical', 'Both'], visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 'Virtual' },
      { key: 'interestNominalAnnual', label: 'Tasa nominal anual (%)', type: 'number', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 15.6 },
      { key: 'interestEffectiveAnnual', label: 'Tasa efectiva anual (%)', type: 'number', visibleWhen: { key: 'accountType', value: 'CreditCard' }, defaultValue: 16.77 },
      { key: 'isActive', label: 'Activa', type: 'boolean', table: true }
    ]
  },
  creditCards: {
    key: 'creditCards',
    title: 'Tarjetas de Credito',
    subtitle: 'Cupos, saldos usados, fechas de pago y cortes mensuales.',
    icon: 'pi pi-credit-card',
    path: 'credit-cards',
    fields: [
      { key: 'accountName', label: 'Cuenta', type: 'text', readonly: true, table: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, defaultValue: 'Tarjeta Diners' },
      { key: 'issuer', label: 'Emisor', type: 'text', required: true, table: true, defaultValue: 'Banco Diners Club del Ecuador' },
      { key: 'brand', label: 'Marca', type: 'select', required: true, options: ['DinersClub', 'Discover', 'Visa', 'Mastercard', 'Other'], table: true, defaultValue: 'Discover' },
      { key: 'productName', label: 'Producto', type: 'text', table: true },
      { key: 'lastFour', label: 'Ultimos 4', type: 'text', table: true },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR'], table: true, defaultValue: 'USD' },
      { key: 'creditLimit', label: 'Cupo', type: 'currency', required: true, table: true, defaultValue: 500 },
      { key: 'outstandingBalance', label: 'Usado', type: 'currency', readonly: true, table: true },
      { key: 'availableCredit', label: 'Disponible', type: 'currency', readonly: true, table: true },
      { key: 'statementClosingDay', label: 'Dia de corte', type: 'number', required: true, table: true, defaultValue: 1 },
      { key: 'paymentDueDay', label: 'Dia de pago', type: 'number', required: true, table: true, defaultValue: 15 },
      { key: 'paymentMode', label: 'Modo de pago', type: 'select', options: ['Manual', 'AutomaticMinimum', 'AutomaticTotal'], defaultValue: 'Manual' },
      { key: 'rewardsProgram', label: 'Recompensas', type: 'text', defaultValue: 'Miles' },
      { key: 'statementDelivery', label: 'Estado de cuenta', type: 'select', options: ['Virtual', 'Physical', 'Both'], defaultValue: 'Virtual' },
      { key: 'interestNominalAnnual', label: 'Tasa nominal anual (%)', type: 'number', defaultValue: 15.6 },
      { key: 'interestEffectiveAnnual', label: 'Tasa efectiva anual (%)', type: 'number', defaultValue: 16.77 },
      { key: 'nextDueDate', label: 'Proximo pago', type: 'date', readonly: true, table: true },
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
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR', 'BTC', 'ETH'], table: true, defaultValue: 'USD' },
      { key: 'accountId', label: 'Cuenta origen', type: 'select', required: true, table: true },
      { key: 'toAccountId', label: 'Cuenta destino', type: 'select', visibleWhen: { key: 'type', value: 'Transfer' } },
      { key: 'categoryId', label: 'Categoria', type: 'select', table: true },
      { key: 'budgetId', label: 'Presupuesto', type: 'select', table: true, visibleWhen: { key: 'type', value: 'Expense' } },
      { key: 'description', label: 'Descripcion', type: 'textarea', table: true, placeholder: 'Ej: Taxi al banco, compras de casa, pago de deuda...' },
      { key: 'attachmentCount', label: 'Evidencias', type: 'number', readonly: true, table: true },
      { key: 'reference', label: 'Referencia', type: 'text', readonly: true },
      { key: 'transactionDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
      { key: 'recurringRuleId', label: 'Regla recurrente', type: 'text', readonly: true },
      { key: 'tagIds', label: 'Tags', type: 'multiselect' },
      { key: 'creditCardOperationType', label: 'Operacion tarjeta', type: 'select', options: ['Purchase', 'Payment', 'Refund', 'Fee', 'Interest', 'CashAdvance'] },
      { key: 'isForeignCreditCardTransaction', label: 'Consumo exterior', type: 'boolean', defaultValue: false },
      { key: 'installmentCount', label: 'Cuotas', type: 'number' },
      { key: 'merchant', label: 'Comercio', type: 'text' },
      { key: 'creditCardStatementId', label: 'Estado tarjeta', type: 'text', readonly: true }
    ]
  },
  budgets: {
    key: 'budgets',
    title: 'Presupuestos',
    subtitle: 'Límites de gasto por periodo para controlar tus salidas.',
    icon: 'pi pi-chart-pie',
    path: 'budgets',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'limitAmount', label: 'Límite', type: 'currency', required: true, table: true },
      { key: 'usedAmount', label: 'Usado', type: 'currency', readonly: true, table: true },
      { key: 'remainingAmount', label: 'Disponible', type: 'currency', readonly: true, table: true },
      { key: 'usage', label: 'Uso', type: 'text', readonly: true, table: true },
      { key: 'periodType', label: 'Periodo', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Yearly'], table: true },
      { key: 'validityType', label: 'Vigencia', type: 'select', required: true, options: ['Indefinite', 'FixedPeriod'], table: true },
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
      { key: 'color', label: 'Color', type: 'color', required: true, table: true, defaultValue: '#16794a' }
    ]
  },
  financialGoals: {
    key: 'financialGoals',
    title: 'Metas',
    subtitle: 'Objetivos financieros de ahorro, compra o personalizados.',
    icon: 'pi pi-flag',
    path: 'goals',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, table: true },
      { key: 'targetAmount', label: 'Monto objetivo', type: 'currency', required: true, table: true },
      { key: 'currentAmount', label: 'Acumulado', type: 'currency', readonly: true, table: true },
      { key: 'remainingAmount', label: 'Faltante', type: 'currency', readonly: true, table: true },
      { key: 'progress', label: 'Avance', type: 'text', readonly: true, table: true },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: ['Saving', 'Purchase', 'Custom'], table: true, defaultValue: 'Saving' },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: ['InProgress', 'Ready', 'Completed', 'Cancelled'], table: true, defaultValue: 'InProgress' },
      { key: 'priority', label: 'Prioridad', type: 'number', required: true, table: true, defaultValue: 1 },
      { key: 'suggestedMonthlyContribution', label: 'Aporte mensual', type: 'currency', readonly: true, table: true },
      { key: 'accountId', label: 'Cuenta destino', type: 'select', table: true },
      { key: 'targetDate', label: 'Fecha objetivo', type: 'date', table: true },
      { key: 'completedAt', label: 'Completada en', type: 'date', visibleWhen: { key: 'status', value: 'Completed' } },
      { key: 'description', label: 'Descripcion', type: 'textarea', table: true },
      { key: 'url', label: 'URL', type: 'text', visibleWhen: { key: 'type', value: 'Purchase' } }
    ],
    children: [
      {
        title: 'Aportes',
        listPath: 'goal-contributions',
        createPath: 'goals/{id}/contributions',
        updatePath: 'goal-contributions/{id}',
        deletePath: 'goal-contributions/{id}',
        queryParam: 'goalId',
        parentParam: 'goalId',
        fields: [
          { key: 'amount', label: 'Monto', type: 'currency', required: true, table: true },
          { key: 'accountId', label: 'Cuenta a debitar', type: 'select', required: true, table: true },
          { key: 'contributionDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
          { key: 'transactionId', label: 'Transaccion', type: 'text', table: true }
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
      { key: 'paidAmount', label: 'Abonado', type: 'currency', readonly: true, table: true },
      { key: 'progress', label: 'Avance', type: 'text', readonly: true, table: true },
      { key: 'currency', label: 'Moneda', type: 'select', required: true, options: ['USD', 'EUR'], table: true },
      { key: 'dueDate', label: 'Vence', type: 'date', required: true, table: true },
      { key: 'accountId', label: 'Cuenta asociada', type: 'select', required: true },
      { key: 'status', label: 'Estado', type: 'select', options: ['Active', 'Paid', 'Cancelled'], table: true },
      { key: 'interestRate', label: 'Tasa de interés (%)', type: 'number' },
      { key: 'interestPeriod', label: 'Periodicidad de interés', type: 'select', options: ['Monthly', 'Annual'] },
      { key: 'amortizationMethod', label: 'Método de amortización', type: 'select', options: ['French', 'German'] },
      { key: 'termMonths', label: 'Plazo en meses', type: 'number' },
      { key: 'loanStartDate', label: 'Inicio del préstamo', type: 'date' },
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
          { key: 'accountId', label: 'Cuenta del movimiento', type: 'select', required: true, table: true },
          { key: 'paymentDate', label: 'Fecha', type: 'date', required: true, table: true, showTime: true, defaultNow: true },
          { key: 'notes', label: 'Notas', type: 'textarea', table: true },
          { key: 'transactionId', label: 'Transaccion', type: 'text', table: true, readonly: true }
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
