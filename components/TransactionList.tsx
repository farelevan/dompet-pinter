import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { formatNumber, parseNumber } from '../utils/format';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
    transactions: Transaction[];
    onEdit: (id: string, updatedTx: Partial<Transaction>) => void;
    onDelete: (id: string) => void;
}

const CATEGORIES = {
    INCOME: ['Gaji', 'Bonus', 'Dividen', 'Freelance', 'Lainnya'],
    EXPENSE: ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']
};

export const TransactionList: React.FC<Props> = ({ transactions, onEdit, onDelete }) => {
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
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Riwayat Transaksi</h3>
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
                                                    setEditForm({ ...editForm, type: newType, category: CATEGORIES[newType][0] });
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
                                                {(editForm.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => (
                                                    <option key={c} value={c}>{c}</option>
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
                                            <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
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
