export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export enum InvestmentType {
  GOLD = 'Emas',
  STOCK = 'Saham',
  CRYPTO = 'Crypto',
}

export interface Investment {
  id: string;
  symbol: string; // e.g., 'ANTM', 'BTC', 'BBCA'
  name: string;
  type: InvestmentType;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number; // Updated via "realtime" simulation
}

export enum GoalType {
  EMERGENCY = 'Dana Darurat',
  RETIREMENT = 'Pensiun',
  WEDDING = 'Menikah',
  OTHER = 'Lainnya',
}

export interface SavingsGoal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface AppState {
  transactions: Transaction[];
  investments: Investment[];
  goals: SavingsGoal[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}