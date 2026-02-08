import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, PiggyBank, BarChart3, MessageSquare, TrendingUp } from 'lucide-react';
import { AppState, Investment, InvestmentType, Transaction, TransactionType, SavingsGoal, GoalType } from './types';
import { Dashboard } from './components/Dashboard';
import { Investments } from './components/Investments';
import { Savings } from './components/Savings';
import { TransactionForm } from './components/TransactionForm';
import { Advisor } from './components/Advisor';
import { TransactionList } from './components/TransactionList';

// Mock Initial Data
const INITIAL_STATE: AppState = {
  transactions: [
    { id: '1', date: '2023-10-01', description: 'Gaji Bulanan', amount: 15000000, type: 'INCOME', category: 'Gaji' },
    { id: '2', date: '2023-10-02', description: 'Sewa Apartemen', amount: 4500000, type: 'EXPENSE', category: 'Tagihan' },
    { id: '3', date: '2023-10-05', description: 'Belanja Bulanan', amount: 2000000, type: 'EXPENSE', category: 'Belanja' },
  ],
  investments: [
    { id: '1', symbol: 'ANTM', name: 'Aneka Tambang', type: InvestmentType.STOCK, quantity: 5000, avgBuyPrice: 1800, currentPrice: 1950 },
    { id: '2', symbol: 'BBCA', name: 'Bank Central Asia', type: InvestmentType.STOCK, quantity: 200, avgBuyPrice: 9000, currentPrice: 9200 },
    { id: '3', symbol: 'BTC', name: 'Bitcoin', type: InvestmentType.CRYPTO, quantity: 0.05, avgBuyPrice: 500000000, currentPrice: 550000000 },
    { id: '4', symbol: 'EMAS', name: 'Emas Batangan', type: InvestmentType.GOLD, quantity: 10, avgBuyPrice: 1000000, currentPrice: 1100000 },
  ],
  goals: [
    { id: '1', name: 'Dana Darurat', type: GoalType.EMERGENCY, targetAmount: 50000000, currentAmount: 25000000 },
    { id: '2', name: 'Liburan Jepang', type: GoalType.OTHER, targetAmount: 30000000, currentAmount: 5000000 },
    { id: '3', name: 'Menikah', type: GoalType.WEDDING, targetAmount: 150000000, currentAmount: 45000000 },
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'investments' | 'goals' | 'advisor'>('dashboard');
  const [state, setState] = useState<AppState>(INITIAL_STATE);

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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Ringkasan Keuangan'}
              {activeTab === 'transactions' && 'Riwayat Transaksi'}
              {activeTab === 'investments' && 'Portofolio Investasi'}
              {activeTab === 'goals' && 'Tujuan Finansial'}
              {activeTab === 'advisor' && 'Konsultasi AI'}
            </h2>
            <p className="text-slate-500 text-sm">Selamat datang kembali, Pengguna.</p>
          </div>
          <div className="flex gap-2">
            {/* Additional header controls can go here */}
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard state={state} />}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionForm onAddTransaction={addTransaction} />
              </div>
              <div className="lg:col-span-2">
                <TransactionList
                  transactions={state.transactions}
                  onEdit={editTransaction}
                  onDelete={deleteTransaction}
                />
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <Investments investments={state.investments} onAddInvestment={addInvestment} />
          )}

          {activeTab === 'goals' && (
            <Savings goals={state.goals} onAddGoal={addGoal} onUpdateAmount={updateGoalAmount} />
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

export default App;