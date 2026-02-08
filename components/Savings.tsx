import React, { useState } from 'react';
import { GoalType, SavingsGoal } from '../types';
import { Target, Heart, Briefcase, ShieldAlert, Plus, Edit2, Trash2, X, Check, MinusCircle } from 'lucide-react';
import { formatNumber, parseNumber } from '../utils/format';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  // CRUD props
  onEdit?: (id: string, updatedGoal: Partial<SavingsGoal>) => void;
  onDelete?: (id: string) => void;
}

const getIcon = (type: GoalType) => {
  switch (type) {
    case GoalType.EMERGENCY: return <ShieldAlert className="text-rose-500" />;
    case GoalType.WEDDING: return <Heart className="text-pink-500" />;
    case GoalType.RETIREMENT: return <Briefcase className="text-blue-500" />;
    default: return <Target className="text-purple-500" />;
  }
};

export const Savings: React.FC<Props> = ({ goals, onAddGoal, onUpdateAmount, onEdit, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', type: GoalType.OTHER, targetAmount: '' });

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SavingsGoal>>({});

  // State for delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      name: newGoal.name,
      type: newGoal.type,
      targetAmount: parseNumber(newGoal.targetAmount)
    });
    setIsAdding(false);
    setNewGoal({ name: '', type: GoalType.OTHER, targetAmount: '' });
  };

  const startEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setEditForm({ ...goal });
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

  const handleWithdraw = (id: string) => {
    const val = prompt("Masukkan jumlah penarikan:");
    if (val) {
      const amount = parseFloat(val);
      if (amount > 0) {
        onUpdateAmount(id, -amount);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Hapus Tujuan Tabungan"
        message="Apakah Anda yakin ingin menghapus tujuan tabungan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Tujuan Finansial</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> Tambah Tujuan
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 animate-fade-in">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-slate-500 mb-1 block">Nama Tujuan</label>
              <input required type="text" className="border p-2 rounded-lg w-full" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} placeholder="Misal: Dana Darurat 6 Bulan" />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-slate-500 mb-1 block">Tipe</label>
              <select className="border p-2 rounded-lg w-full" value={newGoal.type} onChange={e => setNewGoal({ ...newGoal, type: e.target.value as GoalType })}>
                {Object.values(GoalType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-slate-500 mb-1 block">Target (IDR)</label>
              <input
                required
                type="text"
                inputMode="numeric"
                className="border p-2 rounded-lg w-full"
                value={newGoal.targetAmount}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setNewGoal({ ...newGoal, targetAmount: formatNumber(value) });
                }}
              />
            </div>
            <button className="bg-emerald-500 text-white py-2 px-6 rounded-lg hover:bg-emerald-600 w-full md:w-auto">Simpan</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

          if (editingId === goal.id) {
            return (
              <div key={goal.id} className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
                <div className="flex flex-col gap-3">
                  <input
                    className="border rounded p-2 text-sm w-full"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nama Tujuan"
                  />
                  <select
                    className="border rounded p-2 text-sm w-full"
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value as GoalType })}
                  >
                    {Object.values(GoalType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    className="border rounded p-2 text-sm w-full"
                    value={typeof editForm.targetAmount === 'number' ? formatNumber(editForm.targetAmount) : ''}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEditForm({ ...editForm, targetAmount: val ? parseInt(val) : 0 });
                    }}
                    placeholder="Target Amount"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={saveEdit} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-1"><Check size={16} /> Simpan</button>
                    <button onClick={cancelEdit} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 flex items-center gap-1"><X size={16} /> Batal</button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(goal)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDeleteClick(goal.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded"><Trash2 size={16} /></button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    {getIcon(goal.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{goal.name}</h3>
                    <span className="text-xs text-slate-500">{goal.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Target</p>
                  <p className="font-bold text-slate-700">IDR {goal.targetAmount.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Tercapai: IDR {goal.currentAmount.toLocaleString('id-ID')}</span>
                <span className="text-slate-500">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateAmount(goal.id, 100000)}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  + 100rb
                </button>
                <button
                  onClick={() => onUpdateAmount(goal.id, 500000)}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  + 500rb
                </button>
                <button
                  onClick={() => {
                    const val = prompt("Masukkan jumlah penambahan:");
                    if (val) onUpdateAmount(goal.id, parseFloat(val));
                  }}
                  className="flex-1 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-400 hover:text-blue-600 hover:border-blue-300"
                >
                  Custom
                </button>
                <button
                  onClick={() => handleWithdraw(goal.id)}
                  className="px-3 py-2 border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50"
                  title="Tarik Saldo"
                >
                  <MinusCircle size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};