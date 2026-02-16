import React from 'react';
import { useDateRange } from '../contexts/DateRangeContext';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const DateRangePicker: React.FC = () => {
    const { startDate, endDate, setStartDate, setEndDate, preset, setPreset } = useDateRange();

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPreset(value);
        const now = new Date();

        switch (value) {
            case 'thisMonth':
                setStartDate(startOfMonth(now));
                setEndDate(endOfMonth(now));
                break;
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                setStartDate(startOfMonth(lastMonth));
                setEndDate(endOfMonth(lastMonth));
                break;
            case 'last30Days':
                setStartDate(subDays(now, 30));
                setEndDate(now);
                break;
            case 'thisYear':
                setStartDate(startOfYear(now));
                setEndDate(endOfYear(now));
                break;
            case 'custom':
                // Keep current dates
                break;
        }
    };

    return (
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
            <Calendar size={16} className="text-slate-500 ml-2" />
            <select
                value={preset}
                onChange={handlePresetChange}
                className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
                <option value="thisMonth">Bulan Ini</option>
                <option value="lastMonth">Bulan Lalu</option>
                <option value="last30Days">30 Hari Terakhir</option>
                <option value="thisYear">Tahun Ini</option>
                <option value="custom">Custom</option>
            </select>

            {preset === 'custom' && (
                <div className="flex items-center gap-2 text-sm border-l border-slate-200 pl-2 ml-2">
                    <input
                        type="date"
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="border rounded px-2 py-1 text-xs"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={format(endDate, 'yyyy-MM-dd')}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="border rounded px-2 py-1 text-xs"
                    />
                </div>
            )}

            {preset !== 'custom' && (
                <div className="text-xs text-slate-500 px-2 border-l border-slate-200 ml-2">
                    {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM yyyy')}
                </div>
            )}
        </div>
    );
};
