export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: string;
  totalExpense: string;
  netBalance: string;
  savingsRate: number;
  expenseCount: number;
  incomeCount: number;
  comparedToLastMonth?: {
    expenseDiff: number;
    incomeDiff: number;
  };
}

export interface CategoryBreakdownItem {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  totalAmount: string;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: number;
  totalIncome: string;
  totalExpense: string;
  netBalance: string;
}

export interface DailyHeatmapItem {
  date: string;
  amount: string;
}

export interface TopExpenseItem {
  id: string;
  title: string;
  amount: string;
  date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}
