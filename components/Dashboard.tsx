import React from 'react';
import { AppState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDateRange } from '../contexts/DateRangeContext';
import { parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';

interface Props {
  state: AppState;
}

export const Dashboard: React.FC<Props> = ({ state }) => {
  const { startDate, endDate } = useDateRange();

  // Filter Transactions by Date Range
  const filteredTransactions = state.transactions.filter(t => {
    const tDate = parseISO(t.date);
    return isWithinInterval(tDate, { start: startOfDay(startDate), end: endOfDay(endDate) });
  });

  // Calculate Totals based on filtered data
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Global Net Worth (Not filtered by date, as it's a snapshot)
  const totalPortfolio = state.investments.reduce((acc, inv) => acc + (inv.quantity * inv.currentPrice), 0);
  const netWorth = state.investments.reduce((acc, inv) => acc + (inv.quantity * inv.currentPrice), 0) +
    state.goals.reduce((acc, g) => acc + g.currentAmount, 0) +
    (state.transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0));

  // Helper to get category color
  const getCategoryColor = (catName: string, type: 'INCOME' | 'EXPENSE') => {
    const cat = state.categories?.find(c => c.name === catName && c.type === type);
    return cat?.color || '#cbd5e1';
  };

  // Group Expenses by Category
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensePieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key],
    color: getCategoryColor(key, 'EXPENSE')
  })).sort((a, b) => b.value - a.value);

  // Group Income by Category
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.keys(incomeByCategory).map(key => ({
    name: key,
    value: incomeByCategory[key],
    color: getCategoryColor(key, 'INCOME')
  })).sort((a, b) => b.value - a.value);

  // Prepare Trend Data (Daily within the range)
  // Simplifying for demo: Group by date
  const trendMap: Record<string, { date: string, income: number, expense: number }> = {};

  filteredTransactions.forEach(t => {
    if (!trendMap[t.date]) {
      trendMap[t.date] = { date: t.date, income: 0, expense: 0 };
    }
    if (t.type === 'INCOME') trendMap[t.date].income += t.amount;
    else trendMap[t.date].expense += t.amount;
  });

  // Convert to array and sort
  const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
    ...d,
    formattedDate: format(parseISO(d.date), 'dd MMM')
  }));

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Wallet size={18} />
            <span className="text-sm font-medium">Net Worth (Total)</span>
          </div>
          <p className="text-2xl font-bold">IDR {netWorth.toLocaleString('id-ID', { notation: "compact" })}</p>
          <div className="mt-2 text-xs text-slate-400">Semua Waktu</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <ArrowUpRight size={18} />
            <span className="text-sm font-medium">Pemasukan</span>
          </div>
          <p className="text-xl font-bold text-slate-800">IDR {totalIncome.toLocaleString('id-ID')}</p>
          <div className="mt-1 text-xs text-slate-400">Periode Ini</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-rose-500">
            <ArrowDownRight size={18} />
            <span className="text-sm font-medium">Pengeluaran</span>
          </div>
          <p className="text-xl font-bold text-slate-800">IDR {totalExpense.toLocaleString('id-ID')}</p>
          <div className="mt-1 text-xs text-slate-400">Periode Ini</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Sisa (Cashflow)</span>
          </div>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
            IDR {Math.abs(balance).toLocaleString('id-ID')}
          </p>
          <div className={`mt-1 text-xs ${balance >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
            {balance >= 0 ? 'Surplus' : 'Defisit'} Periode Ini
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-6">Arus Kas (Periode Ini)</h3>
          <div className="h-72">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis hide />
                  <ReTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada data transaksi di periode ini.
              </div>
            )}
          </div>
        </div>

        {/* Expense Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Distribusi Pengeluaran</h3>
          <div className="h-64 flex items-center justify-center">
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">Belum ada data pengeluaran</div>
            )}
          </div>
          {expensePieData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-h-32 overflow-y-auto">
              {expensePieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Sumber Pemasukan</h3>
          <div className="h-64 flex items-center justify-center">
            {incomePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">Belum ada data pemasukan</div>
            )}
          </div>
          {incomePieData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-h-32 overflow-y-auto">
              {incomePieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};