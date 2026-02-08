import React, { useState } from 'react';
import { Investment, InvestmentType } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, RefreshCw, Edit2, Trash2, X, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber, parseNumber } from '../utils/format';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  investments: Investment[];
  onAddInvestment: (inv: Omit<Investment, 'id' | 'currentPrice'>) => void;
  onEdit?: (id: string, updatedInv: Partial<Investment>) => void;
  onDelete?: (id: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Investments: React.FC<Props> = ({ investments, onAddInvestment, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [newInv, setNewInv] = useState({
    symbol: '',
    name: '',
    type: InvestmentType.STOCK,
    quantity: '',
    avgBuyPrice: ''
  });

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Investment>>({});

  // State for delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalValue = investments.reduce((acc, cur) => acc + (cur.quantity * cur.currentPrice), 0);
  const totalCost = investments.reduce((acc, cur) => acc + (cur.quantity * cur.avgBuyPrice), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInvestment({
      symbol: newInv.symbol.toUpperCase(),
      name: newInv.name,
      type: newInv.type,
      quantity: parseFloat(newInv.quantity),
      avgBuyPrice: parseNumber(newInv.avgBuyPrice)
    });
    setNewInv({ symbol: '', name: '', type: InvestmentType.STOCK, quantity: '', avgBuyPrice: '' });
    setShowForm(false);
  };

  const startEdit = (inv: Investment) => {
    setEditingId(inv.id);
    setEditForm({ ...inv });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm && onEdit) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const chartData = investments.map(inv => ({
    name: inv.symbol,
    value: inv.quantity * inv.currentPrice
  }));

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Hapus Investasi"
        message="Apakah Anda yakin ingin menghapus aset investasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Portfolio Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Nilai Portofolio</h3>
          <p className="text-3xl font-bold">IDR {totalValue.toLocaleString('id-ID')}</p>
          <div className={`flex items-center mt-2 text-sm ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalGain >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            <span>{totalGain >= 0 ? '+' : ''}{totalGain.toLocaleString('id-ID')} ({gainPercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h4 className="text-slate-500 text-sm font-medium mb-2">Alokasi Aset</h4>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `IDR ${value.toLocaleString('id-ID')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-blue-200 shadow-lg"
          >
            <DollarSign size={20} /> Tambah Aset
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fade-in-down">
          <h3 className="font-semibold text-slate-800 mb-4">Input Aset Baru</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tipe</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={newInv.type}
                onChange={e => setNewInv({ ...newInv, type: e.target.value as InvestmentType })}
              >
                {Object.values(InvestmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Simbol (e.g., BBCA, BTC)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={newInv.symbol}
                onChange={e => setNewInv({ ...newInv, symbol: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nama Aset</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={newInv.name}
                onChange={e => setNewInv({ ...newInv, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah Unit</label>
              <input
                type="number" step="any"
                className="w-full p-2 border rounded-lg"
                value={newInv.quantity}
                onChange={e => setNewInv({ ...newInv, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Harga Beli Rata-rata (IDR)</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full p-2 border rounded-lg"
                value={newInv.avgBuyPrice}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setNewInv({ ...newInv, avgBuyPrice: formatNumber(value) });
                }}
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* Assets List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-700">Daftar Aset</h3>
          <div className="flex items-center text-xs text-slate-500 gap-1">
            <RefreshCw size={12} className="animate-spin-slow" /> Live Update
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Simbol</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Harga Saat Ini</th>
                <th className="px-6 py-3">Nilai Total</th>
                <th className="px-6 py-3">P/L</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investments.map(inv => {
                const val = inv.quantity * inv.currentPrice;
                const cost = inv.quantity * inv.avgBuyPrice;
                const pl = val - cost;
                const plPercent = (pl / cost) * 100;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <>
                          <input
                            className="border rounded p-1 w-20 text-xs mb-1"
                            value={editForm.symbol}
                            onChange={e => setEditForm({ ...editForm, symbol: e.target.value })}
                          />
                          <input
                            className="border rounded p-1 w-full text-xs"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-slate-900">{inv.symbol}</div>
                          <div className="text-xs text-slate-500">{inv.name}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <select
                          className="border rounded p-1 text-xs"
                          value={editForm.type}
                          onChange={e => setEditForm({ ...editForm, type: e.target.value as InvestmentType })}
                        >
                          {Object.values(InvestmentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${inv.type === InvestmentType.CRYPTO ? 'bg-purple-100 text-purple-800' :
                            inv.type === InvestmentType.GOLD ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}`}>
                          {inv.type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">IDR {inv.currentPrice.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {editingId === inv.id ? (
                        <span className="text-xs text-slate-400">Auto</span>
                      ) : (
                        `IDR ${val.toLocaleString('id-ID')}`
                      )}
                    </td>
                    <td className={`px-6 py-4 font-medium ${pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {editingId === inv.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            className="border rounded p-1 w-20 text-xs"
                            type="number" step="any"
                            value={editForm.quantity}
                            onChange={e => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) })}
                            placeholder="Qty"
                          />
                          <input
                            className="border rounded p-1 w-24 text-xs"
                            value={typeof editForm.avgBuyPrice === 'number' ? formatNumber(editForm.avgBuyPrice) : ''}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setEditForm({ ...editForm, avgBuyPrice: val ? parseInt(val) : 0 });
                            }}
                            placeholder="Avg Price"
                          />
                        </div>
                      ) : (
                        `${pl >= 0 ? '+' : ''}${plPercent.toFixed(2)}%`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === inv.id ? (
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(inv)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteClick(inv.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Belum ada aset investasi. Tambahkan sekarang!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};