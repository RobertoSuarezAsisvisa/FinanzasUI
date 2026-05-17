import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import {
  Account,
  AccountingPeriod,
  Budget,
  Category,
  CryptoAccount,
  CryptoLot,
  Debt,
  DebtPayment,
  AccountSummary,
  AccountingPeriodSummary,
  BudgetSummary,
  DebtSummary,
  FinanceOverviewSummary,
  GoalContribution,
  Id,
  PagedResult,
  PurchaseGoal,
  PurchaseGoalSummary,
  RecurringRule,
  SavingGoal,
  SavingGoalSummary,
  Tag,
  Transaction,
  TransactionSummary,
  UserContextEntry
} from '../models/finance.models';
import { ApiService, QueryParams } from './api.service';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class AccountsService extends CrudService<Account> {
  constructor(api: ApiService) {
    super(api, 'accounts');
  }
}

@Injectable({ providedIn: 'root' })
export class TransactionsService extends CrudService<Transaction> {
  constructor(api: ApiService) {
    super(api, 'transactions');
  }
}

@Injectable({ providedIn: 'root' })
export class CategoriesService extends CrudService<Category> {
  constructor(api: ApiService) {
    super(api, 'categories');
  }
}

@Injectable({ providedIn: 'root' })
export class TagsService extends CrudService<Tag> {
  constructor(api: ApiService) {
    super(api, 'tags');
  }
}

@Injectable({ providedIn: 'root' })
export class BudgetsService extends CrudService<Budget> {
  constructor(api: ApiService) {
    super(api, 'budgets');
  }
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  readonly savingGoals: CrudService<SavingGoal>;
  readonly purchaseGoals: CrudService<PurchaseGoal>;

  constructor(private readonly api: ApiService) {
    this.savingGoals = new (class extends CrudService<SavingGoal> {
      constructor(apiService: ApiService) {
        super(apiService, 'saving-goals');
      }
    })(this.api);

    this.purchaseGoals = new (class extends CrudService<PurchaseGoal> {
      constructor(apiService: ApiService) {
        super(apiService, 'purchase-goals');
      }
    })(this.api);
  }

  listSavingContributions(goalId: Id): Observable<GoalContribution[]> {
    return this.api.get<GoalContribution[]>('saving-goal-contributions', { goalId });
  }

  addSavingContribution(goalId: Id, payload: Partial<GoalContribution>): Observable<GoalContribution> {
    return this.api.post<GoalContribution>(`saving-goals/${goalId}/contributions`, payload);
  }

  updateSavingContribution(id: Id, payload: Partial<GoalContribution>): Observable<GoalContribution> {
    return this.api.put<GoalContribution>(`saving-goal-contributions/${id}`, payload);
  }

  deleteSavingContribution(id: Id): Observable<void> {
    return this.api.delete<void>(`saving-goal-contributions/${id}`);
  }

  listPurchaseContributions(purchaseGoalId: Id): Observable<GoalContribution[]> {
    return this.api.get<GoalContribution[]>('purchase-goal-contributions', { purchaseGoalId });
  }

  addPurchaseContribution(purchaseGoalId: Id, payload: Partial<GoalContribution>): Observable<GoalContribution> {
    return this.api.post<GoalContribution>(`purchase-goals/${purchaseGoalId}/contributions`, payload);
  }

  updatePurchaseContribution(id: Id, payload: Partial<GoalContribution>): Observable<GoalContribution> {
    return this.api.put<GoalContribution>(`purchase-goal-contributions/${id}`, payload);
  }

  deletePurchaseContribution(id: Id): Observable<void> {
    return this.api.delete<void>(`purchase-goal-contributions/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DebtsService extends CrudService<Debt> {
  constructor(api: ApiService) {
    super(api, 'debts');
  }

  listPayments(debtId: Id): Observable<DebtPayment[]> {
    return this.api.get<DebtPayment[]>('debt-payments', { debtId });
  }

  addPayment(debtId: Id, payload: Partial<DebtPayment>): Observable<DebtPayment> {
    return this.api.post<DebtPayment>(`debts/${debtId}/payments`, payload);
  }

  updatePayment(id: Id, payload: Partial<DebtPayment>): Observable<DebtPayment> {
    return this.api.put<DebtPayment>(`debt-payments/${id}`, payload);
  }

  deletePayment(id: Id): Observable<void> {
    return this.api.delete<void>(`debt-payments/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CryptoService {
  constructor(private readonly api: ApiService) {}

  listAccounts(accountId?: Id): Observable<CryptoAccount[]> {
    return this.api.get<CryptoAccount[]>('crypto-accounts', { accountId });
  }

  createAccount(payload: Partial<CryptoAccount>): Observable<CryptoAccount> {
    return this.api.post<CryptoAccount>('crypto-accounts', payload);
  }

  updateAccount(id: Id, payload: Partial<CryptoAccount>): Observable<CryptoAccount> {
    return this.api.put<CryptoAccount>(`crypto-accounts/${id}`, payload);
  }

  deleteAccount(id: Id): Observable<void> {
    return this.api.delete<void>(`crypto-accounts/${id}`);
  }

  listLots(accountId?: Id): Observable<CryptoLot[]> {
    return this.api.get<CryptoLot[]>('crypto-lots', { accountId });
  }

  createLot(payload: Partial<CryptoLot>): Observable<CryptoLot> {
    return this.api.post<CryptoLot>('crypto-lots', payload);
  }

  updateLot(id: Id, payload: Partial<CryptoLot>): Observable<CryptoLot> {
    return this.api.put<CryptoLot>(`crypto-lots/${id}`, payload);
  }

  deleteLot(id: Id): Observable<void> {
    return this.api.delete<void>(`crypto-lots/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly api: ApiService) {}

  financeOverview(query?: QueryParams): Observable<FinanceOverviewSummary> {
    return this.api.get<FinanceOverviewSummary>('reports/finance-overview', query);
  }

  health(): Observable<unknown> {
    return this.api.get<unknown>('health');
  }
}

export interface DashboardPayload {
  overview: FinanceOverviewSummary | null;
  accounts: AccountSummary[];
  categories: Category[];
  transactions: TransactionSummary[];
  weeklyTransactions: TransactionSummary[];
  budgets: BudgetSummary[];
  savingGoals: SavingGoalSummary[];
  purchaseGoals: PurchaseGoalSummary[];
  debts: DebtSummary[];
  periods: AccountingPeriodSummary[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService, private readonly reports: ReportsService) {}

  load(query?: QueryParams, weeklyQuery?: QueryParams): Observable<DashboardPayload> {
    return forkJoin({
      overview: this.reports.financeOverview(query).pipe(catchError(() => of(null))),
      accounts: this.api.get<AccountSummary[]>('accounts').pipe(catchError(() => of([]))),
      categories: this.api.get<Category[]>('categories').pipe(catchError(() => of([]))),
      transactions: this.api.get<PagedResult<TransactionSummary>>('transactions', { ...query, page: 1, pageSize: 1000 }).pipe(
        map((response) => response.items),
        catchError(() => of([]))
      ),
      weeklyTransactions: this.api.get<PagedResult<TransactionSummary>>('transactions', { ...weeklyQuery, page: 1, pageSize: 1000 }).pipe(
        map((response) => response.items),
        catchError(() => of([]))
      ),
      budgets: this.api.get<BudgetSummary[]>('budgets').pipe(catchError(() => of([]))),
      savingGoals: this.api.get<SavingGoalSummary[]>('saving-goals').pipe(catchError(() => of([]))),
      purchaseGoals: this.api.get<PurchaseGoalSummary[]>('purchase-goals').pipe(catchError(() => of([]))),
      debts: this.api.get<DebtSummary[]>('debts').pipe(catchError(() => of([]))),
      periods: this.api.get<AccountingPeriodSummary[]>('accounting-periods').pipe(catchError(() => of([])))
    });
  }
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly accountingPeriods: CrudService<AccountingPeriod>;
  readonly recurringRules: CrudService<RecurringRule>;

  constructor(private readonly api: ApiService) {
    this.accountingPeriods = new (class extends CrudService<AccountingPeriod> {
      constructor(apiService: ApiService) {
        super(apiService, 'accounting-periods');
      }

      override list(query?: QueryParams): Observable<AccountingPeriod[]> {
        return super.list(query ?? { status: 'Open' });
      }
    })(this.api);

    this.recurringRules = new (class extends CrudService<RecurringRule> {
      constructor(apiService: ApiService) {
        super(apiService, 'recurring-rules');
      }
    })(this.api);
  }

  listUserContext(): Observable<UserContextEntry[]> {
    return this.api.get<UserContextEntry[]>('user-context');
  }

  updateUserContext(contextKey: Id, payload: Partial<UserContextEntry>): Observable<UserContextEntry> {
    return this.api.put<UserContextEntry>(`user-context/${contextKey}`, payload);
  }

  deleteUserContext(contextKey: Id): Observable<void> {
    return this.api.delete<void>(`user-context/${contextKey}`);
  }
}
