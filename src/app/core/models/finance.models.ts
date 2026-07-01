export type Id = string;

export type TransactionType = 'Income' | 'Expense' | 'Transfer';
export type AccountType = 'Bank' | 'Cash' | 'DigitalWallet' | 'Crypto' | 'CreditCard' | string;
export type AccountPurpose = 'Spending' | 'Savings' | 'Investment' | 'Reserved' | string;
export type CreditCardBrand = 'DinersClub' | 'Discover' | 'Visa' | 'Mastercard' | 'Other' | string;
export type CreditCardPaymentMode = 'Manual' | 'AutomaticMinimum' | 'AutomaticTotal' | string;
export type CreditCardStatementDelivery = 'Virtual' | 'Physical' | 'Both' | string;
export type CreditCardOperationType = 'Purchase' | 'Payment' | 'Refund' | 'Fee' | 'Interest' | 'CashAdvance' | string;
export type FinancialGoalType = 'Saving' | 'Purchase' | 'Custom';
export type FinancialGoalStatus = 'InProgress' | 'Ready' | 'Completed' | 'Cancelled';
export type GoalStatus = FinancialGoalStatus | string;
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
  creditCardId?: Id | null;
  creditCardIssuer?: string | null;
  creditCardBrand?: CreditCardBrand | null;
  creditCardProductName?: string | null;
  creditCardLastFour?: string | null;
  creditLimit?: number | null;
  outstandingBalance?: number | null;
  availableCredit?: number | null;
  statementClosingDay?: number | null;
  paymentDueDay?: number | null;
  paymentMode?: CreditCardPaymentMode | null;
  rewardsProgram?: string | null;
  statementDelivery?: CreditCardStatementDelivery | null;
  interestNominalAnnual?: number | null;
  interestEffectiveAnnual?: number | null;
  isActive?: boolean;
}

export interface CreditCard {
  id?: Id;
  accountId?: Id;
  accountName?: string;
  name?: string;
  currency: string;
  issuer: string;
  brand: CreditCardBrand;
  productName?: string | null;
  lastFour?: string | null;
  creditLimit: number;
  outstandingBalance?: number;
  availableCredit?: number;
  statementClosingDay: number;
  paymentDueDay: number;
  paymentMode?: CreditCardPaymentMode;
  rewardsProgram?: string | null;
  statementDelivery?: CreditCardStatementDelivery;
  interestNominalAnnual?: number | null;
  interestEffectiveAnnual?: number | null;
  isActive?: boolean;
  nextDueDate?: string | null;
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
  attachmentCount?: number;
  creditCardOperationType?: CreditCardOperationType | null;
  creditCardStatementId?: Id | null;
  isForeignCreditCardTransaction?: boolean;
  installmentCount?: number | null;
  merchant?: string | null;
}

export interface Budget {
  id?: Id;
  name: string;
  limitAmount: number;
  periodType: string;
  validityType: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  isActive?: boolean;
  usedAmount?: number;
  remainingAmount?: number;
  usagePercent?: number;
  transactionCount?: number;
  isOverLimit?: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface GoalContribution {
  id?: Id;
  goalId?: Id;
  amount: number;
  contributionDate: string;
  transactionId?: Id | null;
  accountId?: Id | null;
}

export interface FinancialGoal {
  id?: Id;
  name: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  suggestedMonthlyContribution?: number | null;
  accountId?: Id | null;
  targetDate?: string | null;
  status: FinancialGoalStatus;
  type: FinancialGoalType;
  priority: number;
  url?: string | null;
  completedAt?: string | null;
}

export interface FinancialGoalContribution {
  id: Id;
  goalId: Id;
  transactionId?: Id | null;
  accountId?: Id | null;
  amount: number;
  contributionDate: string;
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
  creditCardId?: Id | null;
  creditCardIssuer?: string | null;
  creditCardBrand?: CreditCardBrand | null;
  creditCardProductName?: string | null;
  creditCardLastFour?: string | null;
  creditLimit?: number | null;
  outstandingBalance?: number | null;
  availableCredit?: number | null;
  statementClosingDay?: number | null;
  paymentDueDay?: number | null;
  paymentMode?: CreditCardPaymentMode | null;
  rewardsProgram?: string | null;
  statementDelivery?: CreditCardStatementDelivery | null;
  interestNominalAnnual?: number | null;
  interestEffectiveAnnual?: number | null;
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
  attachmentCount: number;
  creditCardAccountId?: Id | null;
  creditCardOperationType?: CreditCardOperationType | null;
  creditCardStatementId?: Id | null;
  isForeignCreditCardTransaction?: boolean;
  installmentCount?: number | null;
  merchant?: string | null;
}

export interface TransactionAttachment {
  id: Id;
  transactionId: Id;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  contentUrl: string;
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
  limitAmount: number;
  periodType: string;
  validityType: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  isActive: boolean;
  usedAmount: number;
  remainingAmount: number;
  usagePercent: number;
  transactionCount: number;
  isOverLimit: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface BudgetUsageHistoryPoint {
  periodStart: string;
  periodEnd: string;
  groupKey: string;
  spentAmount: number;
  limitAmount: number;
  remainingAmount: number;
  usagePercent: number;
  transactionCount: number;
  isOverLimit: boolean;
}

export type FinancialGoalSummary = FinancialGoal & { id: Id };

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
  goalsProgress: number;
}
