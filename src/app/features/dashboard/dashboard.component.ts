import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';

import { DashboardService, ReportsService } from '../../core/api/domain-services';
import {
  AccountingPeriodSummary,
  AccountSummary,
  BudgetSummary,
  Category,
  DebtSummary,
  FinanceOverviewSummary,
  PurchaseGoalSummary,
  SavingGoalSummary,
  TransactionSummary
} from '../../core/models/finance.models';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MoneyCellComponent } from '../../shared/money-cell/money-cell.component';

interface FlowPoint {
  label: string;
  fullLabel: string;
  dateKey: string;
  income: number;
  expense: number;
  net: number;
  x: number;
  incomeHeight: number;
  expenseHeight: number;
  incomeY: number;
  expenseY: number;
  netY: number;
}

interface FlowChart {
  netPath: string;
  points: FlowPoint[];
  subtitle: string;
  totalIncome: number;
  totalExpense: number;
  totalNet: number;
}

interface AccountTile {
  id: string;
  name: string;
  accountType: string;
  purpose: string;
  currency: string;
  balance: number;
  share: number;
  isActive: boolean;
}

interface GoalTile {
  id: string;
  title: string;
  kind: 'Ahorro' | 'Compra';
  target: number;
  current: number;
  progress: number;
  status: string;
  dueDate?: string | null;
  suggestedMonthlyContribution?: number | null;
  accountId?: string | null;
  priority: number;
}

interface DebtTile {
  id: string;
  contactName: string;
  type: string;
  remainingAmount: number;
  originalAmount: number;
  currency: string;
  progress: number;
  status: string;
  dueDate?: string | null;
}

interface BudgetTile {
  id: string;
  name: string;
  limitAmount: number;
  periodType: string;
  validityType: string;
  isActive: boolean;
}

interface BiMetric {
  label: string;
  value: string;
  detail: string;
  tone: string;
  tooltip: string;
}

interface OverviewCard {
  label: string;
  value: number;
  detail: string;
  icon: string;
  money: boolean;
  tone: string;
  tooltip: string;
}

interface BiBar {
  label: string;
  value: number;
  formatted: string;
  percent: number;
  tone?: string;
}

interface BiSlice {
  label: string;
  value: number;
  formatted: string;
  percent: number;
  color: string;
}

interface BudgetUsage {
  id: string;
  categoryId?: string | null;
  name: string;
  limit: number;
  spent: number;
  percent: number;
  remaining: number;
  periodType: string;
  transactions: TransactionSummary[];
}

interface DashboardState {
  overview: FinanceOverviewSummary | null;
  accounts: AccountSummary[];
  budgets: BudgetSummary[];
  categories: Category[];
  debts: DebtSummary[];
  periods: AccountingPeriodSummary[];
  purchaseGoals: PurchaseGoalSummary[];
  savingGoals: SavingGoalSummary[];
  transactions: TransactionSummary[];
  weeklyTransactions: TransactionSummary[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    MoneyCellComponent,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    CurrencyPipe,
    DatePipe,
    PanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TagModule,
    TableModule,
    TooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  categoriesDialogVisible = false;
  budgetsDialogVisible = false;
  healthOk = signal(false);
  lastRefreshed = signal<Date | null>(null);
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  state = signal<DashboardState | null>(null);

  overview = computed(() => this.state()?.overview ?? null);
  accounts = computed(() => this.state()?.accounts ?? []);
  budgets = computed(() => this.state()?.budgets ?? []);
  categories = computed(() => this.state()?.categories ?? []);
  debts = computed(() => this.state()?.debts ?? []);
  periods = computed(() => this.state()?.periods ?? []);
  purchaseGoals = computed(() => this.state()?.purchaseGoals ?? []);
  savingGoals = computed(() => this.state()?.savingGoals ?? []);
  transactions = computed(() => this.state()?.transactions ?? []);
  weeklyTransactions = computed(() => this.state()?.weeklyTransactions ?? []);
  dateRangeLabel = computed(() => {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (!from && !to) {
      return 'Todo el historial';
    }

    if (from && to) {
      return `${this.formatDateLabel(from)} - ${this.formatDateLabel(to)}`;
    }

    return from ? `Desde ${this.formatDateLabel(from)}` : `Hasta ${this.formatDateLabel(to!)}`;
  });

  ready = computed(() => !this.loading() || !!this.state());
  currentPeriod = computed(() => this.periods()[0] ?? null);
  currentPeriodName = computed(() => this.currentPeriod()?.name ?? 'Sin periodo abierto');
  totalIncome = computed(() => this.sumTransactions(this.transactions(), 'Income'));
  totalExpenses = computed(() => this.sumTransactions(this.transactions(), 'Expense'));
  activeAccountList = computed(() => this.accounts().filter((account) => account.isActive));
  totalAccountBalance = computed(() => this.sum(this.activeAccountList(), 'balance'));
  spendingBalance = computed(() => this.sum(this.activeAccountList().filter((account) => this.accountPurpose(account) === 'Spending'), 'balance'));
  savingsBalance = computed(() => this.sum(this.activeAccountList().filter((account) => this.accountPurpose(account) === 'Savings'), 'balance'));
  investmentBalance = computed(() => this.sum(this.activeAccountList().filter((account) => this.accountPurpose(account) === 'Investment'), 'balance'));
  reservedBalance = computed(() => this.sum(this.activeAccountList().filter((account) => this.accountPurpose(account) === 'Reserved'), 'balance'));
  activeAccounts = computed(() => this.accounts().filter((account) => account.isActive).length);
  activeBudgets = computed(() => this.budgets().filter((budget) => budget.isActive).length);
  totalBudgetLimit = computed(() => this.sum(this.budgets(), 'limitAmount'));
  totalDebtRemaining = computed(() => this.payableTotal());
  activeDebts = computed(() => this.debts().filter((debt) => debt.type === 'Payable' && debt.status === 'Active').length);
  receivableTotal = computed(() =>
    this.debts()
      .filter((debt) => debt.type === 'Receivable' && debt.status === 'Active')
      .reduce((total, debt) => total + debt.remainingAmount, 0)
  );
  payableTotal = computed(() =>
    this.debts()
      .filter((debt) => debt.type === 'Payable' && debt.status === 'Active')
      .reduce((total, debt) => total + debt.remainingAmount, 0)
  );
  totalGoals = computed(() => this.savingGoals().length + this.purchaseGoals().length);
  totalGoalTarget = computed(
    () => this.sum(this.savingGoals(), 'targetAmount') + this.sum(this.purchaseGoals(), 'targetPrice')
  );
  totalGoalCurrent = computed(
    () => this.sum(this.savingGoals(), 'currentAmount') + this.sum(this.purchaseGoals(), 'savedAmount')
  );
  totalGoalRemaining = computed(() => Math.max(0, this.totalGoalTarget() - this.totalGoalCurrent()));
  totalGoalProgress = computed(() => (this.totalGoalTarget() > 0 ? Math.min(100, (this.totalGoalCurrent() / this.totalGoalTarget()) * 100) : 0));
  recentTransactions = computed(() => this.sortedTransactions().slice(0, 6));
  topAccounts = computed(() =>
    this.accounts()
      .slice()
      .sort((a, b) => b.balance - a.balance)
      .map((account) => this.toAccountTile(account))
  );
  topBudgets = computed(() =>
    this.budgets()
      .slice()
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || b.limitAmount - a.limitAmount)
      .slice(0, 4)
      .map((budget) => this.toBudgetTile(budget))
  );
  topGoals = computed(() =>
    [...this.savingGoals(), ...this.purchaseGoals()]
      .slice()
      .sort((a, b) => {
        const progressDiff = this.goalProgress(a) - this.goalProgress(b);
        if (progressDiff !== 0) {
          return progressDiff;
        }

        return this.goalDueDateValue(a) - this.goalDueDateValue(b);
      })
      .slice(0, 4)
      .map((goal) => this.toGoalTile(goal))
  );
  detailedGoals = computed(() =>
    [...this.savingGoals(), ...this.purchaseGoals()]
      .slice()
      .sort((a, b) => {
        const dueDiff = this.goalDueDateValue(a) - this.goalDueDateValue(b);
        if (dueDiff !== 0) {
          return dueDiff;
        }

        return this.goalProgress(a) - this.goalProgress(b);
      })
      .map((goal) => this.toGoalTile(goal))
  );
  topDebts = computed(() =>
    this.debts()
      .slice()
      .sort((a, b) => this.debtDueDateValue(a) - this.debtDueDateValue(b) || b.remainingAmount - a.remainingAmount)
      .slice(0, 4)
      .map((debt) => this.toDebtTile(debt))
  );
  flowChart = computed(() => this.buildFlowChart(this.weeklyTransactions()));
  transactionMix = computed(() => this.buildTransactionMix(this.transactions()));
  expenseByCategory = computed(() => this.allExpenseByCategory().slice(0, 5));
  allExpenseByCategory = computed(() => this.buildExpenseByCategory(this.transactions()));
  expenseByAccount = computed(() => this.buildExpenseByAccount(this.transactions()));
  debtExposure = computed(() => this.buildDebtExposure(this.debts()));
  budgetUsage = computed(() => this.allBudgetUsage().slice(0, 3));
  allBudgetUsage = computed(() => this.buildBudgetUsage());
  biMetrics = computed<BiMetric[]>(() => {
    const transfers = this.transactions().filter((transaction) => transaction.type === 'Transfer').length;
    const monthlyNeed = [...this.savingGoals(), ...this.purchaseGoals()].reduce(
      (total, goal) => total + Number(goal.suggestedMonthlyContribution ?? 0),
      0
    );

    return [
      {
        label: 'Movimientos',
        value: String(this.transactions().length),
        detail: `${transfers} transferencias registradas`,
        tone: 'asset',
        tooltip: 'Cantidad total de transacciones cargadas en el sistema. Incluye ingresos, gastos y transferencias.'
      },
      {
        label: 'Gasto promedio',
        value: this.formatAmount(this.averageExpenseTicket(), 'USD'),
        detail: 'Ticket medio de gastos',
        tone: 'expense',
        tooltip: 'Promedio de cada gasto registrado: total de gastos dividido para la cantidad de movimientos de tipo gasto.'
      },
      {
        label: 'Compromiso mensual',
        value: this.formatAmount(monthlyNeed, 'USD'),
        detail: 'Aporte sugerido a metas',
        tone: 'goal',
        tooltip: 'Suma de los aportes mensuales sugeridos para tus metas de ahorro y compra.'
      },
      {
        label: 'Por cobrar',
        value: this.formatAmount(this.receivableTotal(), 'USD'),
        detail: 'Dinero que te deben',
        tone: 'income',
        tooltip: 'Suma de deudas activas de tipo por cobrar. Representa dinero pendiente de recibir.'
      },
      {
        label: 'Por pagar',
        value: this.formatAmount(this.payableTotal(), 'USD'),
        detail: `${this.activeDebts()} deudas activas`,
        tone: 'debt',
        tooltip: 'Suma de saldos pendientes solo en deudas por pagar activas. No incluye valores por cobrar.'
      }
    ];
  });
  financialSummary = computed<FinanceOverviewSummary>(() => {
    const overview = this.overview();

    if (overview) {
      return {
        ...overview,
        totalDebts: this.payableTotal()
      };
    }

    return {
      totalIncome: this.totalIncome(),
      totalExpenses: this.totalExpenses(),
      netBalance: this.totalIncome() - this.totalExpenses(),
      totalAssets: this.totalAccountBalance(),
      totalDebts: this.totalDebtRemaining(),
      savingGoalsProgress: this.averageProgress(this.savingGoals()),
      purchaseGoalsProgress: this.averageProgress(this.purchaseGoals())
    };
  });
  overviewCards = computed<OverviewCard[]>(() => {
    const summary = this.financialSummary();

    return [
      {
        label: 'Activos totales',
        value: summary.totalAssets,
        detail: `${this.activeAccounts()} cuentas activas`,
        icon: 'pi pi-wallet',
        money: true,
        tone: 'asset',
        tooltip: 'Suma del balance actual de todas tus cuentas activas: disponible, ahorro, inversión y reservado.'
      },
      {
        label: 'Disponible',
        value: this.spendingBalance(),
        detail: 'Para gasto diario',
        icon: 'pi pi-wallet',
        money: true,
        tone: 'income',
        tooltip: 'Dinero disponible para gastar. Incluye solo cuentas activas marcadas con uso Spending.'
      },
      {
        label: 'Ingresos',
        value: summary.totalIncome,
        detail: 'Entradas registradas',
        icon: 'pi pi-arrow-down-left',
        money: true,
        tone: 'income',
        tooltip: 'Total de transacciones registradas como ingreso.'
      },
      {
        label: 'Gastos',
        value: summary.totalExpenses,
        detail: 'Salidas registradas',
        icon: 'pi pi-arrow-up-right',
        money: true,
        tone: 'expense',
        tooltip: 'Total de transacciones registradas como gasto.'
      },
      {
        label: 'Neto',
        value: summary.netBalance,
        detail: summary.netBalance >= 0 ? 'Balance positivo' : 'Requiere atención',
        icon: 'pi pi-chart-line',
        money: true,
        tone: summary.netBalance >= 0 ? 'income' : 'expense',
        tooltip: 'Resultado de ingresos menos gastos. Un valor positivo indica superávit.'
      },
      {
        label: 'Metas',
        value: this.totalGoals(),
        detail: `${this.totalGoalProgress().toFixed(0)}% global completado`,
        icon: 'pi pi-flag',
        money: false,
        tone: 'goal',
        tooltip: 'Cantidad de metas de ahorro y metas de compra registradas.'
      },
      {
        label: 'Por pagar',
        value: summary.totalDebts,
        detail: `${this.activeDebts()} deudas activas`,
        icon: 'pi pi-credit-card',
        money: true,
        tone: 'debt',
        tooltip: 'Suma de saldos pendientes solo en deudas por pagar activas. No incluye valores por cobrar.'
      }
    ];
  });

  constructor(
    private readonly dashboard: DashboardService,
    private readonly reports: ReportsService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.dashboard
      .load(this.dashboardQuery(), this.currentWeekQuery())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (state) => {
          this.state.set(state);
          this.lastRefreshed.set(new Date());
        },
        error: () => {
          this.state.set({
            overview: null,
            accounts: [],
            budgets: [],
            categories: [],
            debts: [],
            periods: [],
            purchaseGoals: [],
            savingGoals: [],
            transactions: [],
            weeklyTransactions: []
          });
          this.lastRefreshed.set(new Date());
        }
      });

    this.reports.health().subscribe({
      next: () => this.healthOk.set(true),
      error: () => this.healthOk.set(false)
    });
  }

  applyDateFilter(): void {
    this.load();
  }

  clearDateFilter(): void {
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.load();
  }

  setCurrentMonth(): void {
    const today = new Date();
    this.dateFrom.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.dateTo.set(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    this.load();
  }

  setLastSevenDays(): void {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    this.dateFrom.set(from);
    this.dateTo.set(today);
    this.load();
  }

  setToday(): void {
    const today = new Date();
    this.dateFrom.set(today);
    this.dateTo.set(today);
    this.load();
  }

  flowSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const chart = this.flowChart();
    if (!chart.points.length) {
      return 'secondary';
    }

    return chart.totalNet >= 0 ? 'success' : 'danger';
  }

  flowHeadline(): string {
    const chart = this.flowChart();
    if (!chart.points.length) {
      return 'Aun no hay movimientos suficientes';
    }

    const today = this.todayFlowPoint() ?? chart.points.at(-1)!;
    const activeDays = chart.points.filter((point) => point.income > 0 || point.expense > 0).length;

    if (chart.totalNet >= 0) {
      return activeDays > 1 ? 'La semana va en positivo' : 'Semana positiva por ahora';
    }

    return today.net < 0 ? 'Hoy los gastos pesan más' : 'La semana sigue en negativo';
  }

  flowSubtext(): string {
    const chart = this.flowChart();
    if (!chart.points.length) {
      return 'Todavía no hay transacciones para construir la curva diaria de esta semana.';
    }

    const todayPoint = this.todayFlowPoint() ?? chart.points.at(-1)!;
    return `Hoy: ingresos ${this.formatAmount(todayPoint.income, 'USD')}, gastos ${this.formatAmount(todayPoint.expense, 'USD')} y neto ${this.formatAmount(todayPoint.net, 'USD')}.`;
  }

  flowBadgeLabel(): string {
    const severity = this.flowSeverity();

    if (severity === 'success') {
      return 'Positivo';
    }

    if (severity === 'danger') {
      return 'Atención';
    }

    return 'Sin datos';
  }

  cardCurrency(value: number | null | undefined, currency = 'USD'): string {
    return this.formatAmount(value ?? 0, currency);
  }

  healthSeverity(): 'success' | 'danger' {
    return this.healthOk() ? 'success' : 'danger';
  }

  healthLabel(): string {
    return this.healthOk() ? 'Online' : 'Pendiente';
  }

  flowTooltip(): string {
    return 'Evalúa el flujo diario de la semana actual: compara ingresos contra gastos y muestra el neto por día.';
  }

  mixTooltip(item: BiSlice): string {
    return `${item.label}: ${item.formatted}. Representa ${item.percent}% del volumen total de movimientos.`;
  }

  barTooltip(item: BiBar): string {
    return `${item.label}: ${item.formatted}. La barra compara este valor contra el mayor valor de la lista.`;
  }

  budgetTooltip(budget: BudgetUsage): string {
    return `${budget.name}: ${this.formatAmount(budget.spent, 'USD')} usados de ${this.formatAmount(budget.limit, 'USD')}. Queda ${this.formatAmount(budget.remaining, 'USD')}. ${budget.transactions.length} transacciones.`;
  }

  flowPointTooltip(point: FlowPoint): string {
    return `${point.fullLabel}: ingresos ${this.formatAmount(point.income, 'USD')}, gastos ${this.formatAmount(point.expense, 'USD')} y neto ${this.formatAmount(point.net, 'USD')}.`;
  }

  accountPurposeLabel(purpose: string): string {
    const labels: Record<string, string> = {
      Spending: 'Disponible',
      Savings: 'Ahorro',
      Investment: 'Inversión',
      Reserved: 'Reservada'
    };

    return labels[purpose] ?? purpose;
  }

  goalSummaryTooltip(): string {
    return `${this.totalGoals()} metas registradas. Objetivo total: ${this.formatAmount(this.totalGoalTarget(), 'USD')}. Ahorrado: ${this.formatAmount(this.totalGoalCurrent(), 'USD')}. Faltante: ${this.formatAmount(this.totalGoalRemaining(), 'USD')}.`;
  }

  goalRowTooltip(goal: GoalTile): string {
    return `${goal.title}: ${this.formatAmount(goal.current, 'USD')} ahorrados de ${this.formatAmount(goal.target, 'USD')}. Falta ${this.formatAmount(this.goalRemaining(goal), 'USD')}. Fecha objetivo: ${this.goalDueLabel(goal)}.`;
  }

  goalRemaining(goal: GoalTile): number {
    return Math.max(0, goal.target - goal.current);
  }

  goalDueLabel(goal: GoalTile): string {
    if (!goal.dueDate) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(goal.dueDate));
  }

  goalDaysLabel(goal: GoalTile): string {
    if (!goal.dueDate) {
      return 'Sin fecha objetivo';
    }

    const due = new Date(goal.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);

    if (days < 0) {
      return `Venció hace ${Math.abs(days)} días`;
    }

    if (days === 0) {
      return 'Vence hoy';
    }

    return `Faltan ${days} días`;
  }

  goalAccountLabel(goal: GoalTile): string {
    return goal.accountId ? this.accountName(goal.accountId) : 'Sin cuenta vinculada';
  }

  transactionSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (type === 'Income') {
      return 'success';
    }

    if (type === 'Expense') {
      return 'danger';
    }

    return 'info';
  }

  private sortedTransactions(): TransactionSummary[] {
    return this.transactions()
      .slice()
      .sort((a, b) => this.transactionDateValue(b) - this.transactionDateValue(a));
  }

  private toAccountTile(account: AccountSummary): AccountTile {
    const share = this.totalAccountBalance() > 0 ? (account.balance / this.totalAccountBalance()) * 100 : 0;

    return {
      id: String(account.id),
      name: account.name,
      accountType: account.accountType,
      purpose: this.accountPurpose(account),
      currency: account.currency,
      balance: account.balance,
      share: Math.min(100, Math.max(0, share)),
      isActive: account.isActive
    };
  }

  private toBudgetTile(budget: BudgetSummary): BudgetTile {
    return {
      id: String(budget.id),
      name: budget.name,
      limitAmount: budget.limitAmount,
      periodType: budget.periodType,
      validityType: budget.validityType,
      isActive: budget.isActive
    };
  }

  private toGoalTile(goal: SavingGoalSummary | PurchaseGoalSummary): GoalTile {
    if (this.isSavingGoal(goal)) {
      return {
        id: String(goal.id),
        title: goal.name,
        kind: 'Ahorro',
        target: goal.targetAmount,
        current: goal.currentAmount,
        progress: this.goalProgress(goal),
        status: goal.status,
        dueDate: goal.targetDate ?? null,
        suggestedMonthlyContribution: goal.suggestedMonthlyContribution ?? null,
        accountId: goal.accountId ?? null,
        priority: 0
      };
    }

    return {
      id: String(goal.id),
      title: goal.name,
      kind: 'Compra',
      target: goal.targetPrice,
      current: goal.savedAmount,
      progress: this.goalProgress(goal),
      status: goal.status,
      dueDate: goal.targetDate ?? null,
      suggestedMonthlyContribution: goal.suggestedMonthlyContribution ?? null,
      accountId: goal.accountId ?? null,
      priority: goal.priority
    };
  }

  private toDebtTile(debt: DebtSummary): DebtTile {
    return {
      id: String(debt.id),
      contactName: debt.contactName,
      type: debt.type,
      remainingAmount: debt.remainingAmount,
      originalAmount: debt.originalAmount,
      currency: debt.currency,
      progress: debt.originalAmount > 0 ? Math.min(100, ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100) : 0,
      status: debt.status,
      dueDate: debt.dueDate ?? null
    };
  }

  private buildFlowChart(transactions: TransactionSummary[]): FlowChart {
    const days = this.buildCurrentWeekDays();
    const points = days.map((date, index) => {
      const dailyTransactions = transactions.filter((transaction) => this.isSameLocalDay(transaction.transactionDate, date));
      const income = this.sumTransactions(dailyTransactions, 'Income');
      const expense = this.sumTransactions(dailyTransactions, 'Expense');
      const net = income - expense;

      return {
        label: new Intl.DateTimeFormat('es-EC', { weekday: 'short' }).format(date),
        fullLabel: new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'short' }).format(date),
        dateKey: this.localDateKey(date),
        income,
        expense,
        net,
        x: 68 + index * 96,
        incomeHeight: 0,
        expenseHeight: 0,
        incomeY: 0,
        expenseY: 0,
        netY: 0
      };
    });

    const maxValue = Math.max(...points.flatMap((point) => [point.income, point.expense]), 1);
    const maxNet = Math.max(...points.map((point) => Math.abs(point.net)), 1);
    const chartHeight = 180;
    const baseline = 248;
    const netBaseline = 150;

    const renderedPoints = points.map((point) => {
      const incomeHeight = point.income > 0 ? Math.max(6, Math.round((point.income / maxValue) * chartHeight)) : 0;
      const expenseHeight = point.expense > 0 ? Math.max(6, Math.round((point.expense / maxValue) * chartHeight)) : 0;
      const netY = Math.min(228, Math.max(72, Math.round(netBaseline - (point.net / maxNet) * 76)));

      return {
        ...point,
        incomeHeight,
        expenseHeight,
        incomeY: baseline - incomeHeight,
        expenseY: baseline - expenseHeight,
        netY
      };
    });

    const totalIncome = points.reduce((sum, point) => sum + point.income, 0);
    const totalExpense = points.reduce((sum, point) => sum + point.expense, 0);
    const totalNet = totalIncome - totalExpense;

    return {
      netPath: renderedPoints.map((point) => `${point.x + 2},${point.netY}`).join(' '),
      points: renderedPoints,
      subtitle: `${this.formatAmount(totalIncome, 'USD')} en ingresos, ${this.formatAmount(totalExpense, 'USD')} en gastos y ${this.formatAmount(totalNet, 'USD')} neto esta semana.`,
      totalIncome,
      totalExpense,
      totalNet
    };
  }

  private buildCurrentWeekDays(): Date[] {
    const start = this.startOfCurrentWeek();
    const days: Date[] = [];

    for (let index = 0; index < 7; index++) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      days.push(day);
    }

    return days;
  }

  private buildTransactionMix(transactions: TransactionSummary[]): BiSlice[] {
    const colors: Record<string, string> = {
      Income: '#16794a',
      Expense: '#c84f4f',
      Transfer: '#256f90'
    };
    const totals = ['Income', 'Expense', 'Transfer'].map((type) => ({
      label: this.transactionTypeLabel(type),
      value: transactions.filter((transaction) => transaction.type === type).reduce((total, transaction) => total + transaction.amount, 0),
      color: colors[type]
    }));
    const grandTotal = Math.max(totals.reduce((total, item) => total + item.value, 0), 1);

    return totals.map((item) => ({
      ...item,
      formatted: this.formatAmount(item.value, 'USD'),
      percent: Math.round((item.value / grandTotal) * 100)
    }));
  }

  private buildExpenseByCategory(transactions: TransactionSummary[]): BiBar[] {
    const expenses = transactions.filter((transaction) => transaction.type === 'Expense');
    const totals = new Map<string, number>();

    expenses.forEach((transaction) => {
      const label = this.categoryName(transaction.categoryId);
      totals.set(label, (totals.get(label) ?? 0) + transaction.amount);
    });

    return this.toBars([...totals.entries()].map(([label, value]) => ({ label, value })), 999);
  }

  private buildExpenseByAccount(transactions: TransactionSummary[]): BiBar[] {
    const expenses = transactions.filter((transaction) => transaction.type === 'Expense');
    const totals = new Map<string, number>();

    expenses.forEach((transaction) => {
      const label = this.accountName(transaction.accountId);
      totals.set(label, (totals.get(label) ?? 0) + transaction.amount);
    });

    return this.toBars([...totals.entries()].map(([label, value]) => ({ label, value })), 5);
  }

  private buildDebtExposure(debts: DebtSummary[]): BiBar[] {
    const activeDebts = debts.filter((debt) => debt.status === 'Active');
    return this.toBars(
      activeDebts.map((debt) => ({
        label: `${debt.contactName} (${debt.type === 'Payable' ? 'por pagar' : 'por cobrar'})`,
        value: debt.remainingAmount,
        tone: debt.type === 'Payable' ? 'debt' : 'income'
      })),
      6
    );
  }

  private buildBudgetUsage(): BudgetUsage[] {
    return this.budgets()
      .filter((budget) => budget.isActive)
      .map((budget) => {
        const budgetTransactions = this.transactions()
          .filter((transaction) => transaction.type === 'Expense')
          .filter((transaction) => this.transactionMatchesBudget(transaction, budget));
        const spent = budgetTransactions.reduce((total, transaction) => total + transaction.amount, 0);

        return {
          name: budget.name,
          id: String(budget.id),
          categoryId: budget.categoryId ?? null,
          limit: budget.limitAmount,
          spent,
          percent: budget.limitAmount > 0 ? Math.min(100, (spent / budget.limitAmount) * 100) : 0,
          remaining: Math.max(0, budget.limitAmount - spent),
          periodType: budget.periodType,
          transactions: budgetTransactions
        };
      })
      .sort((a, b) => b.percent - a.percent);
  }

  private accountPurpose(account: AccountSummary): string {
    const explicitPurpose = account.purpose;
    if (explicitPurpose) {
      return explicitPurpose;
    }

    const name = account.name.toLocaleLowerCase();
    if (name.includes('ahorro') || name.includes('emergencia')) {
      return 'Savings';
    }

    if (account.accountType === 'Crypto') {
      return 'Investment';
    }

    return 'Spending';
  }

  private transactionMatchesBudget(transaction: TransactionSummary, budget: BudgetSummary): boolean {
    if (transaction.budgetId !== budget.id) {
      return false;
    }

    return this.isTransactionInsideBudgetPeriod(transaction, budget);
  }

  private isTransactionInsideBudgetPeriod(transaction: TransactionSummary, budget: BudgetSummary): boolean {
    const date = new Date(transaction.transactionDate);
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

  private toBars(items: Array<{ label: string; value: number; tone?: string }>, limit: number): BiBar[] {
    const sorted = items.slice().sort((a, b) => b.value - a.value).slice(0, limit);
    const maxValue = Math.max(...sorted.map((item) => item.value), 1);

    return sorted.map((item) => ({
      ...item,
      formatted: this.formatAmount(item.value, 'USD'),
      percent: Math.min(100, (item.value / maxValue) * 100)
    }));
  }

  private averageExpenseTicket(): number {
    const expenses = this.transactions().filter((transaction) => transaction.type === 'Expense');
    if (!expenses.length) {
      return 0;
    }

    return expenses.reduce((total, transaction) => total + transaction.amount, 0) / expenses.length;
  }

  accountName(accountId?: string | null): string {
    return this.accounts().find((account) => account.id === accountId)?.name ?? 'Cuenta no identificada';
  }

  private categoryName(categoryId?: string | null): string {
    return this.categories().find((category) => category.id === categoryId)?.name ?? 'Sin categoría';
  }

  private transactionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      Income: 'Ingresos',
      Expense: 'Gastos',
      Transfer: 'Transferencias'
    };

    return labels[type] ?? type;
  }

  private goalProgress(goal: SavingGoalSummary | PurchaseGoalSummary): number {
    const target = this.isSavingGoal(goal) ? goal.targetAmount : goal.targetPrice;
    const current = this.isSavingGoal(goal) ? goal.currentAmount : goal.savedAmount;

    if (!target) {
      return 0;
    }

    return Math.min(100, (current / target) * 100);
  }

  private goalDueDateValue(goal: SavingGoalSummary | PurchaseGoalSummary): number {
    return this.parseDate(this.isSavingGoal(goal) ? goal.targetDate : goal.targetDate);
  }

  private debtDueDateValue(debt: DebtSummary): number {
    return this.parseDate(debt.dueDate);
  }

  private transactionDateValue(transaction: TransactionSummary): number {
    return this.parseDate(transaction.transactionDate);
  }

  private parseDate(value?: string | null): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
  }

  private isSameLocalDay(value: string, day: Date): boolean {
    const parsed = new Date(value);
    return (
      parsed.getFullYear() === day.getFullYear() &&
      parsed.getMonth() === day.getMonth() &&
      parsed.getDate() === day.getDate()
    );
  }

  private sum<T extends object>(items: T[], key: keyof T & string): number {
    return items.reduce((total, item) => total + Number((item as Record<string, unknown>)[key] ?? 0), 0);
  }

  private sumTransactions(items: TransactionSummary[], type: 'Income' | 'Expense'): number {
    return items.filter((item) => item.type === type).reduce((total, item) => total + Number(item.amount ?? 0), 0);
  }

  private averageProgress(goals: Array<SavingGoalSummary | PurchaseGoalSummary>): number {
    if (!goals.length) {
      return 0;
    }

    return goals.reduce((total, goal) => total + this.goalProgress(goal), 0) / goals.length;
  }

  private isSavingGoal(goal: SavingGoalSummary | PurchaseGoalSummary): goal is SavingGoalSummary {
    return 'currentAmount' in goal;
  }

  private dashboardQuery(): Record<string, string> {
    return {
      dateFrom: this.dateFrom() ? this.startOfDay(this.dateFrom()!).toISOString() : '',
      dateTo: this.dateTo() ? this.endOfDay(this.dateTo()!).toISOString() : ''
    };
  }

  private currentWeekQuery(): Record<string, string> {
    return {
      dateFrom: this.startOfCurrentWeek().toISOString(),
      dateTo: this.endOfCurrentWeek().toISOString()
    };
  }

  private startOfCurrentWeek(): Date {
    const today = new Date();
    const start = this.startOfDay(today);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    return start;
  }

  private endOfCurrentWeek(): Date {
    const end = this.startOfCurrentWeek();
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private todayFlowPoint(): FlowPoint | null {
    const todayKey = this.localDateKey(new Date());
    return this.flowChart().points.find((point) => point.dateKey === todayKey) ?? null;
  }

  private startOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
  }

  private formatDateLabel(date: Date): string {
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(date);
  }

  private localDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatAmount(value: number, currency: string): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
