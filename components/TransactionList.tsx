import React, { useState } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { Edit2, Trash2, X, Check, Download } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { ConfirmationModal } from './ConfirmationModal';
import { exportTransactionsToCSV } from '../utils/export';

interface Props {
    transactions: Transaction[];
    categories: Category[]; // Added categories prop
    onEdit: (id: string, updatedTx: Partial<Transaction>) => void;
    onDelete: (id: string) => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, categories, onEdit, onDelete }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Transaction>>({});

    // State for delete confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const startEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setEditForm({ ...tx });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = () => {
        if (editingId && editForm) {
            onEdit(editingId, editForm);
            setEditingId(null);
            setEditForm({});
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    const getCategoryColor = (catName: string, type: TransactionType) => {
        const cat = categories.find(c => c.name === catName && c.type === type);
        return cat?.color || '#cbd5e1';
    };

    return (
        <>
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Transaksi"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Riwayat Transaksi</h3>
                    <button
                        onClick={() => exportTransactionsToCSV(transactions)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                        disabled={transactions.length === 0}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">Belum ada transaksi</div>
                    ) : (
                        transactions.map(t => (
                            <div key={t.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                                {editingId === t.id ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            className="border p-2 rounded text-sm w-full"
                                            value={editForm.description || ''}
                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Deskripsi"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                className="border p-2 rounded text-sm flex-1"
                                                value={editForm.type}
                                                onChange={e => {
                                                    const newType = e.target.value as TransactionType;
                                                    // Set default category for new type
                                                    const firstCat = categories.find(c => c.type === newType);
                                                    setEditForm({
                                                        ...editForm,
                                                        type: newType,
                                                        category: firstCat ? firstCat.name : ''
                                                    });
                                                }}
                                            >
                                                <option value="INCOME">Pemasukan</option>
                                                <option value="EXPENSE">Pengeluaran</option>
                                            </select>
                                            <select
                                                className="border p-2 rounded text-sm flex-1"
                                                value={editForm.category}
                                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                {categories.filter(c => c.type === editForm.type).map(c => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="border p-2 rounded text-sm flex-1"
                                                value={typeof editForm.amount === 'number' ? formatNumber(editForm.amount) : ''}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setEditForm({ ...editForm, amount: val ? parseInt(val) : 0 });
                                                }}
                                                placeholder="Jumlah"
                                            />
                                            <input
                                                type="date"
                                                className="border p-2 rounded text-sm w-32"
                                                value={editForm.date}
                                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={cancelEdit} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X size={16} /></button>
                                            <button onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full"><Check size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: getCategoryColor(t.category, t.type) }}>
                                                    {t.category}
                                                </div>
                                                <span className="text-xs text-slate-500">• {t.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-semibold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'} IDR {t.amount.toLocaleString('id-ID')}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteClick(t.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};
