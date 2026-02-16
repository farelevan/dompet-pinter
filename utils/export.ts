import { Transaction } from '../types';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
    if (transactions.length === 0) return;

    const headers = ['Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Jumlah'];
    const csvContent = [
        headers.join(','),
        ...transactions.map(t => {
            return [
                t.date,
                `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
                t.type,
                t.category,
                t.amount
            ].join(',');
        })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_dompetpintar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
