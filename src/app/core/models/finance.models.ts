export type Id = string;

export type TransactionType = 'Income' | 'Expense' | 'Transfer';
export type AccountType = 'Bank' | 'Cash' | 'DigitalWallet' | 'Crypto' | string;
export type AccountPurpose = 'Spending' | 'Savings' | 'Investment' | 'Reserved' | string;
export type GoalStatus = 'InProgress' | 'Saving' | 'Completed' | 'Cancelled' | string;
export type DebtType = 'Payable' | 'Receivable';
export type DebtStatus = 'Active' | 'Paid' | 'Cancelled' | string;
export type PeriodStatus = 'Open' | 'Closed' | string;
export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | string;

export interface Account {
  id?: Id;
  name: string;
  accountType: AccountType;
  currency: string;
  purpose?: AccountPurpose;
  balance?: number;
  bankName?: string | null;
  accountNumber?: string | null;
  provider?: string | null;
  cryptoSymbol?: string | null;
  cryptoNetwork?: string | null;
  cryptoQuantity?: number | null;
  cryptoAvgBuyPriceUsd?: number | null;
  isActive?: boolean;
}

export interface Category {
  id?: Id;
  name: string;
  type: TransactionType;
  icon?: string | null;
  parentId?: Id | null;
  isSystem?: boolean;
}

export interface Tag {
  id?: Id;
  name: string;
  color: string;
}

export interface Transaction {
  id?: Id;
  type: TransactionType;
  amount: number;
  currency: string;
  accountId: Id;
  toAccountId?: Id | null;
  categoryId?: Id | null;
  budgetId?: Id | null;
  description?: string | null;
  reference?: string | null;
  transactionDate: string;
  recurringRuleId?: Id | null;
  tagIds?: Id[];
}

export interface Budget {
  id?: Id;
  name: string;
  categoryId?: Id | null;
  limitAmount: number;
  periodType: string;
  validityType: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  isActive?: boolean;
}

export interface GoalContribution {
  id?: Id;
  amount: number;
  contributionDate: string;
  transactionId?: Id | null;
}

export interface SavingGoal {
  id?: Id;
  name: string;
  targetAmount: number;
  accountId: Id;
  targetDate: string;
  status?: GoalStatus;
}

export interface PurchaseGoal {
  id?: Id;
  name: string;
  targetPrice: number;
  description?: string | null;
  priority?: number;
  url?: string | null;
  accountId: Id;
  targetDate: string;
  status?: GoalStatus;
  purchasedAt?: string | null;
}

export interface Debt {
  id?: Id;
  type: DebtType;
  contactName: string;
  originalAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate: string;
  accountId: Id;
  status?: DebtStatus;
  notes?: string | null;
  interestRate?: number | null;
  interestPeriod?: 'Monthly' | 'Annual' | string | null;
  amortizationMethod?: 'French' | 'German' | string | null;
  termMonths?: number | null;
  loanStartDate?: string | null;
}

export interface DebtPayment {
  id?: Id;
  amount: number;
  paymentDate: string;
  notes?: string | null;
  transactionId?: Id | null;
}

export interface DebtInstallmentSummary {
  id: Id;
  debtId: Id;
  number: number;
  dueDate: string;
  expectedPayment: number;
  principal: number;
  interest: number;
  paidAmount: number;
  pendingAmount: number;
  balanceAfterPayment: number;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Pending' | string;
  daysOverdue: number;
}

export interface CryptoAccount {
  id?: Id;
  accountId: Id;
  symbol: string;
  network: string;
  quantity: number;
  avgBuyPriceUsd: number;
}

export interface CryptoLot {
  id?: Id;
  accountId: Id;
  quantity: number;
  buyPriceUsd: number;
  status: string;
  transactionId?: Id | null;
  sellPriceUsd?: number | null;
  operationDate: string;
}

export interface AccountingPeriod {
  id?: Id;
  name: string;
  startDate: string;
  endDate: string;
  status?: PeriodStatus;
  totalIncome?: number;
  totalExpenses?: number;
  netBalance?: number;
  closedAt?: string | null;
}

export interface RecurringRule {
  id?: Id;
  name: string;
  type: TransactionType;
  amount: number;
  accountId: Id;
  categoryId?: Id | null;
  frequency: Frequency;
  startDate: string;
  endDate?: string | null;
  nextDueDate: string;
  isActive?: boolean;
}

export interface UserContextEntry {
  key?: string;
  contextKey?: string;
  value: string;
}

export interface FinanceOverview {
  totalBalance?: number;
  totalIncome?: number;
  totalExpenses?: number;
  netBalance?: number;
  budgets?: unknown[];
  goals?: unknown[];
  debts?: unknown[];
  [key: string]: unknown;
}

export interface AccountSummary {
  id: Id;
  name: string;
  accountType: AccountType;
  currency: string;
  purpose?: AccountPurpose;
  balance: number;
  isActive: boolean;
  bankName?: string | null;
  accountNumber?: string | null;
  provider?: string | null;
  cryptoSymbol?: string | null;
  cryptoNetwork?: string | null;
  cryptoQuantity?: number | null;
  cryptoAvgBuyPriceUsd?: number | null;
}

export interface TransactionSummary {
  id: Id;
  type: TransactionType;
  amount: number;
  currency: string;
  accountId: Id;
  toAccountId?: Id | null;
  categoryId?: Id | null;
  budgetId?: Id | null;
  description?: string | null;
  reference?: string | null;
  transactionDate: string;
  tagIds?: Id[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BudgetSummary {
  id: Id;
  name: string;
  categoryId?: Id | null;
  limitAmount: number;
  periodType: string;
  validityType: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  isActive: boolean;
}

export interface SavingGoalSummary {
  id: Id;
  name: string;
  targetAmount: number;
  currentAmount: number;
  suggestedMonthlyContribution?: number | null;
  accountId?: Id | null;
  targetDate?: string | null;
  status: GoalStatus;
}

export interface PurchaseGoalSummary {
  id: Id;
  name: string;
  targetPrice: number;
  savedAmount: number;
  suggestedMonthlyContribution?: number | null;
  priority: number;
  url?: string | null;
  accountId?: Id | null;
  targetDate?: string | null;
  status: GoalStatus;
}

export interface DebtSummary {
  id: Id;
  type: DebtType;
  contactName: string;
  originalAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate?: string | null;
  accountId?: Id | null;
  status: DebtStatus;
  notes?: string | null;
  interestRate?: number | null;
  interestPeriod?: 'Monthly' | 'Annual' | string | null;
  amortizationMethod?: 'French' | 'German' | string | null;
  termMonths?: number | null;
  loanStartDate?: string | null;
}

export interface AccountingPeriodSummary {
  id: Id;
  name: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  status: PeriodStatus;
  closedAt?: string | null;
}

export interface FinanceOverviewSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalAssets: number;
  totalDebts: number;
  savingGoalsProgress: number;
  purchaseGoalsProgress: number;
}
