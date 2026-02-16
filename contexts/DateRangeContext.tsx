import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface DateRangeContextType {
    startDate: Date;
    endDate: Date;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    preset: string;
    setPreset: (preset: string) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
    const [preset, setPreset] = useState('thisMonth');

    return (
        <DateRangeContext.Provider value={{ startDate, endDate, setStartDate, setEndDate, preset, setPreset }}>
            {children}
        </DateRangeContext.Provider>
    );
};

export const useDateRange = () => {
    const context = useContext(DateRangeContext);
    if (!context) {
        throw new Error('useDateRange must be used within a DateRangeProvider');
    }
    return context;
};
