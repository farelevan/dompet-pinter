import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { TransactionType } from '../types';
import { formatNumber, parseNumber } from '../utils/format';

interface Props {
  onAddTransaction: (description: string, amount: number, type: TransactionType, category: string) => void;
}

const CATEGORIES = {
  INCOME: ['Gaji', 'Bonus', 'Dividen', 'Freelance', 'Lainnya'],
  EXPENSE: ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
};

export const TransactionForm: React.FC<Props> = ({ onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES.EXPENSE[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAddTransaction(description, parseNumber(amount), type, category);
    setAmount('');
    setDescription('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(formatNumber(value));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Catat Transaksi</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => { setType('INCOME'); setCategory(CATEGORIES.INCOME[0]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <PlusCircle size={16} /> Pemasukan
          </button>
          <button
            type="button"
            onClick={() => { setType('EXPENSE'); setCategory(CATEGORIES.EXPENSE[0]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <MinusCircle size={16} /> Pengeluaran
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Jumlah (IDR)</label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {(type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Keterangan</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Contoh: Makan siang"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
};