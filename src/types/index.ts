export const CATEGORIES = [
  "HOUSING",
  "TRANSPORTATION",
  "FOOD_DINING",
  "FAMILY",
  "HEALTH",
  "ENTERTAINMENT",
  "TRAVEL",
  "TECHNOLOGY",
  "INVESTMENTS",
  "MISCELLANEOUS",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PERSONS = [
  "FAISAL",
  "WIFE",
  "CHILD",
  "SHARED",
  "NEEDS_ATTRIBUTION",
] as const;

export type Person = (typeof PERSONS)[number];

export const SOURCE_TYPES = [
  "MANUAL",
  "RECEIPT_IMAGE",
  "SMS",
  "BANK_NOTIFICATION",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  HOUSING: "Housing",
  TRANSPORTATION: "Transportation",
  FOOD_DINING: "Food & Dining",
  FAMILY: "Family",
  HEALTH: "Health",
  ENTERTAINMENT: "Entertainment",
  TRAVEL: "Travel",
  TECHNOLOGY: "Technology",
  INVESTMENTS: "Investments",
  MISCELLANEOUS: "Miscellaneous",
};

export const PERSON_LABELS: Record<Person, string> = {
  FAISAL: "Faisal",
  WIFE: "Wife",
  CHILD: "Child",
  SHARED: "Shared",
  NEEDS_ATTRIBUTION: "Needs Attribution",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  HOUSING: "#6366f1",
  TRANSPORTATION: "#f59e0b",
  FOOD_DINING: "#10b981",
  FAMILY: "#ec4899",
  HEALTH: "#ef4444",
  ENTERTAINMENT: "#8b5cf6",
  TRAVEL: "#06b6d4",
  TECHNOLOGY: "#3b82f6",
  INVESTMENTS: "#14b8a6",
  MISCELLANEOUS: "#94a3b8",
};

export interface ParsedExpense {
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  category: Category;
  person: Person;
  description?: string;
  items?: { name: string; amount: number }[];
  confidence: number;
}

export interface ExpenseRecord {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  amountAed: number;
  merchant: string;
  date: string;
  description?: string | null;
  category: Category;
  person: Person;
  sourceType: SourceType;
  confidence?: number | null;
  needsReview: boolean;
  items?: string | null;
}

export interface DashboardData {
  totalSpending: number;
  dailyBurnRate: number;
  forecastMonthEnd: number;
  vsLastMonth: number | null;
  byCategory: { category: Category; amount: number; pct: number }[];
  byPerson: { person: Person; amount: number; pct: number }[];
  recentExpenses: ExpenseRecord[];
  daysInMonth: number;
  daysElapsed: number;
  month: string;
}

export interface InsightsData {
  score: number;
  healthLabel: string;
  insights: string[];
  alerts: string[];
  suggestions: string[];
  recurringDetected: {
    merchant: string;
    amount: number;
    frequency: string;
    category: Category;
  }[];
  topCategories: { category: Category; amount: number }[];
}
