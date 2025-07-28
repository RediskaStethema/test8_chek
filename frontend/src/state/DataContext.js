import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();
export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
export function DataProvider({ children }) {
    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const fetchItems = useCallback(async ({ q = '', limit = 20, offset = 0, signal } = {}) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        params.append('limit', String(limit));
        params.append('offset', String(offset));

        const url = `http://localhost:3001/api/items?${params.toString()}`;

        try {
            const res = await fetch(url, { signal });
            if (!res.ok) throw new Error('Error of data loading');
            const data = await res.json();

            setItems(data.items);
            setTotalCount(data.total);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Fetch error:', err);
                throw err;
            }
        }
    }, []);

    return (
        <DataContext.Provider value={{ items, totalCount, fetchItems }}>
            {children}
        </DataContext.Provider>
    );
}

