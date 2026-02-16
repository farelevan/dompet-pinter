import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Plus, Trash2, X, Check, FolderOpen } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
    categories: Category[];
    onAdd: (category: Omit<Category, 'id'>) => void;
    onDelete: (id: string) => void;
}

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#64748b', '#71717a'
];

export const CategoryManager: React.FC<Props> = ({ categories, onAdd, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE' as TransactionType, color: COLORS[0] });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(newCategory);
        setNewCategory({ name: '', type: 'EXPENSE', color: COLORS[0] });
        setIsAdding(false);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Kategori"
                message="Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini tidak akan dihapus, tetapi mungkin kehilangan label kategorinya."
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FolderOpen size={20} className="text-slate-500" /> Manajemen Kategori
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 text-sm bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800"
                >
                    <Plus size={16} /> Tambah Kategori
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in-down">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs text-slate-500 mb-1 block">Nama Kategori</label>
                            <input
                                required
                                type="text"
                                className="border p-2 rounded-lg w-full text-sm"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="Contoh: Belanja Bulanan"
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-xs text-slate-500 mb-1 block">Tipe</label>
                            <select
                                className="border p-2 rounded-lg w-full text-sm"
                                value={newCategory.type}
                                onChange={e => setNewCategory({ ...newCategory, type: e.target.value as TransactionType })}
                            >
                                <option value="EXPENSE">Pengeluaran</option>
                                <option value="INCOME">Pemasukan</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs text-slate-500 mb-1 block">Warna</label>
                            <div className="flex gap-1 flex-wrap w-48">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setNewCategory({ ...newCategory, color: c })}
                                        className={`w-6 h-6 rounded-full border-2 ${newCategory.color === c ? 'border-slate-600 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <button className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 w-full md:w-auto text-sm">Simpan</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Pemasukan</h4>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'INCOME').map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3 bg-white border border-emerald-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></div>
                                    <span className="font-medium text-slate-700">{c.name}</span>
                                </div>
                                <button
                                    onClick={() => setDeleteId(c.id)}
                                    className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {categories.filter(c => c.type === 'INCOME').length === 0 && <p className="text-sm text-slate-400 italic">Belum ada kategori pemasukan.</p>}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Pengeluaran</h4>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'EXPENSE').map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3 bg-white border border-rose-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></div>
                                    <span className="font-medium text-slate-700">{c.name}</span>
                                </div>
                                <button
                                    onClick={() => setDeleteId(c.id)}
                                    className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {categories.filter(c => c.type === 'EXPENSE').length === 0 && <p className="text-sm text-slate-400 italic">Belum ada kategori pengeluaran.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
