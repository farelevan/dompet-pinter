import React, { useState, useEffect } from 'react';
import { DateRangeProvider } from './contexts/DateRangeContext';
import { DateRangePicker } from './components/DateRangePicker';
import { CategoryManager } from './components/CategoryManager';
import { Category, AppState, Investment, Transaction, TransactionType, SavingsGoal } from './types';
import { LayoutDashboard, Wallet, PiggyBank, BarChart3, MessageSquare, TrendingUp, FolderOpen } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Investments } from './components/Investments';
import { Savings } from './components/Savings';
import { TransactionForm } from './components/TransactionForm';
import { Advisor } from './components/Advisor';
import { TransactionList } from './components/TransactionList';

// Mock Initial Data (Cleared for clean start)
const INITIAL_STATE: AppState = {
  transactions: [],
  investments: [],
  goals: [],
  categories: [
    { id: '1', name: 'Gaji', type: 'INCOME', color: '#22c55e' },
    { id: '2', name: 'Bonus', type: 'INCOME', color: '#10b981' },
    { id: '3', name: 'Makan', type: 'EXPENSE', color: '#ef4444' },
    { id: '4', name: 'Transport', type: 'EXPENSE', color: '#f97316' },
    { id: '5', name: 'Belanja', type: 'EXPENSE', color: '#f59e0b' },
    { id: '6', name: 'Hiburan', type: 'EXPENSE', color: '#8b5cf6' },
  ]
};

const STORAGE_KEY = 'dompetpintar_state';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'investments' | 'goals' | 'advisor' | 'categories'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add categories if missing
      if (!parsed.categories || parsed.categories.length === 0) {
        return { ...parsed, categories: INITIAL_STATE.categories };
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Simulate Realtime Market Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        investments: prev.investments.map(inv => {
          // Random fluctuation between -1% and +1%
          const change = 1 + (Math.random() * 0.02 - 0.01);
          return {
            ...inv,
            currentPrice: Math.round(inv.currentPrice * change)
          };
        })
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const addTransaction = (description: string, amount: number, type: TransactionType, category: string) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description,
      amount,
      type,
      category
    };
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  };

  const addInvestment = (inv: Omit<Investment, 'id' | 'currentPrice'>) => {
    const newInv: Investment = {
      ...inv,
      id: Date.now().toString(),
      currentPrice: inv.avgBuyPrice // Initialize with buy price
    };
    setState(prev => ({ ...prev, investments: [...prev.investments, newInv] }));
  };

  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)
    }));
  };

  // --- CRUD Operations ---

  const editTransaction = (id: string, updatedTx: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updatedTx } : t)
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const editInvestment = (id: string, updatedInv: Partial<Investment>) => {
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(i => i.id === id ? { ...i, ...updatedInv } : i)
    }));
  };

  const deleteInvestment = (id: string) => {
    setState(prev => ({
      ...prev,
      investments: prev.investments.filter(i => i.id !== id)
    }));
  };

  const editGoal = (id: string, updatedGoal: Partial<SavingsGoal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // --- Category Operations ---
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setState(prev => ({ ...prev, categories: [...(prev.categories || []), newCategory] }));
  };

  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DompetPintar</h1>
          </div>

          <div className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-2 md:gap-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'transactions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Wallet size={18} /> Transaksi
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'investments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <TrendingUp size={18} /> Investasi
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'goals' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <PiggyBank size={18} /> Tabungan
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <FolderOpen size={18} /> Kategori
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto text-sm font-medium ${activeTab === 'advisor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <MessageSquare size={18} /> AI Advisor
            </button>
          </div>
        </div>

        <div className="mt-auto p-6 md:block hidden">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">Total Aset</p>
            <p className="text-lg font-bold text-white">
              IDR {
                (state.investments.reduce((acc, i) => acc + (i.quantity * i.currentPrice), 0) +
                  state.goals.reduce((acc, g) => acc + g.currentAmount, 0)
                ).toLocaleString('id-ID', { notation: "compact" })
              }
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Ringkasan Keuangan'}
              {activeTab === 'transactions' && 'Riwayat Transaksi'}
              {activeTab === 'investments' && 'Portofolio Investasi'}
              {activeTab === 'goals' && 'Tujuan Finansial'}
              {activeTab === 'categories' && 'Manajemen Kategori'}
              {activeTab === 'advisor' && 'Konsultasi AI'}
            </h2>
            <p className="text-slate-500 text-sm">Selamat datang kembali, Pengguna.</p>
          </div>
          <div className="flex gap-2">
            <DateRangePicker />
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard state={state} />}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionForm onAddTransaction={addTransaction} categories={state.categories || []} />
              </div>
              <div className="lg:col-span-2">
                <TransactionList
                  transactions={state.transactions}
                  categories={state.categories || []}
                  onEdit={editTransaction}
                  onDelete={deleteTransaction}
                />
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <Investments
              investments={state.investments}
              onAddInvestment={addInvestment}
              onEdit={editInvestment}
              onDelete={deleteInvestment}
            />
          )}

          {activeTab === 'goals' && (
            <Savings
              goals={state.goals}
              onAddGoal={addGoal}
              onUpdateAmount={updateGoalAmount}
              onEdit={editGoal}
              onDelete={deleteGoal}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={state.categories || []}
              onAdd={addCategory}
              onDelete={deleteCategory}
            />
          )}

          {activeTab === 'advisor' && (
            <div className="max-w-3xl mx-auto">
              <Advisor context={state} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <DateRangeProvider>
      <AppContent />
    </DateRangeProvider>
  );
}

export default App;