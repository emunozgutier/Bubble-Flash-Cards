/**
 * Utility functions for converting flashcard deck JSON to CSV and vice versa.
 */

export const jsonToCsv = (cards) => {
    if (!cards || cards.length === 0) return '';
    const headers = ['id', 'chinese', 'pinyin', 'english', 'proficiency', 'lastSeen'];
    const csvRows = cards.map(card => {
        return headers.map(header => {
            let val = card[header];
            if (val === null || val === undefined) val = '';
            // Escape double quotes and wrap in quotes
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(',');
    });
    return [headers.join(','), ...csvRows].join('\n');
};

export const csvToJson = (csvString) => {
    if (!csvString) return [];
    const lines = csvString.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const cards = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser
        const rowValues = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                rowValues.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        rowValues.push(current);

        const card = {};
        headers.forEach((header, index) => {
            let val = rowValues[index] ? rowValues[index].replace(/^"|"$/g, '').replace(/""/g, '"') : null;
            if (header === 'proficiency') val = val ? parseInt(val, 10) : 0;
            if (header === 'lastSeen') val = val ? parseInt(val, 10) : null;
            card[header] = val;
        });
        cards.push(card);
    }
    return cards;
};
