import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { TransactionType, Category } from '../types';
import { formatNumber, parseNumber } from '../utils/format';

interface Props {
  onAddTransaction: (description: string, amount: number, type: TransactionType, category: string) => void;
  categories: Category[];
}

export const TransactionForm: React.FC<Props> = ({ onAddTransaction, categories }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Update default category when type or categories change
  useEffect(() => {
    const availableCategories = categories.filter(c => c.type === type);
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0].name);
    } else {
      setCategory('');
    }
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    onAddTransaction(description, parseNumber(amount), type, category);
    setAmount('');
    setDescription('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(formatNumber(value));
  };

  const availableCategories = categories.filter(c => c.type === type);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Catat Transaksi</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <PlusCircle size={16} /> Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
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
            required
            disabled={availableCategories.length === 0}
          >
            {availableCategories.length === 0 && <option value="">Belum ada kategori</option>}
            {availableCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {availableCategories.length === 0 && (
            <p className="text-xs text-rose-500 mt-1">Silakan tambah kategori di menu Kategori.</p>
          )}
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
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!amount || !description || !category}
        >
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
};