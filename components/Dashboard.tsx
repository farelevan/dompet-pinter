import React from 'react';
import { AppState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  state: AppState;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const Dashboard: React.FC<Props> = ({ state }) => {
  // Calculate Totals
  const totalIncome = state.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const totalPortfolio = state.investments.reduce((acc, inv) => acc + (inv.quantity * inv.currentPrice), 0);
  const netWorth = balance + totalPortfolio + state.goals.reduce((acc, g) => acc + g.currentAmount, 0);

  // Group Expenses by Category for Chart
  const expensesByCategory = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Mock Trend Data for Area Chart (just for visuals)
  const data = [
    { name: 'Jan', net: netWorth * 0.8 },
    { name: 'Feb', net: netWorth * 0.85 },
    { name: 'Mar', net: netWorth * 0.82 },
    { name: 'Apr', net: netWorth * 0.9 },
    { name: 'Mei', net: netWorth * 0.95 },
    { name: 'Jun', net: netWorth },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Wallet size={18} />
            <span className="text-sm font-medium">Net Worth</span>
          </div>
          <p className="text-2xl font-bold">IDR {netWorth.toLocaleString('id-ID')}</p>
          <div className="mt-2 text-xs text-slate-400">Total kekayaan bersih</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-2 text-emerald-600">
             <ArrowUpRight size={18} />
             <span className="text-sm font-medium">Pemasukan</span>
           </div>
           <p className="text-xl font-bold text-slate-800">IDR {totalIncome.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-2 text-rose-500">
             <ArrowDownRight size={18} />
             <span className="text-sm font-medium">Pengeluaran</span>
           </div>
           <p className="text-xl font-bold text-slate-800">IDR {totalExpense.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-2 text-blue-600">
             <TrendingUp size={18} />
             <span className="text-sm font-medium">Investasi</span>
           </div>
           <p className="text-xl font-bold text-slate-800">IDR {totalPortfolio.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Pertumbuhan Kekayaan (Simulasi 6 Bulan)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <ReTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`}
                />
                <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Distribusi Pengeluaran</h3>
          <div className="h-64 flex items-center justify-center">
             {pieData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <ReTooltip formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="text-slate-400 text-sm">Belum ada data pengeluaran</div>
             )}
          </div>
          {pieData.length > 0 && (
             <div className="flex flex-wrap justify-center gap-3 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs text-slate-600">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
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