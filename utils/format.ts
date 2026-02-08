export const formatNumber = (value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '';
    const stringValue = typeof value === 'number' ? value.toString() : value.replace(/\./g, '');
    const number = parseInt(stringValue, 10);
    if (isNaN(number)) return '';
    return number.toLocaleString('id-ID');
};

export const parseNumber = (formattedValue: string): number => {
    if (!formattedValue) return 0;
    const cleanValue = formattedValue.replace(/\./g, '');
    return parseInt(cleanValue, 10) || 0;
};
