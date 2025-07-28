import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../state/DataContext'; // Проверь путь
import '@testing-library/jest-dom';


function TestComponent() {
    const { items, totalCount, fetchItems } = useData();

    React.useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div>
            <div data-testid="total-count">{totalCount}</div>
            <ul>
                {items.map((item) => (
                    <li key={item.id} data-testid="item">
                        {item.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

describe('DataProvider', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and provide items and totalCount', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                items: [
                    { id: 1, name: 'Phone' },
                    { id: 2, name: 'Book' },
                ],
                total: 2,
            }),
        });

        render(
            <DataProvider>
                <TestComponent />
            </DataProvider>
        );

        await waitFor(() => {
            expect(screen.getAllByTestId('item')).toHaveLength(2);
            expect(screen.getByText('Phone')).toBeInTheDocument();
            expect(screen.getByText('Book')).toBeInTheDocument();
            expect(screen.getByTestId('total-count')).toHaveTextContent('2');
        });
    });

    it('should not throw if aborted', async () => {
        const abortError = new DOMException('Aborted', 'AbortError');
        fetch.mockRejectedValueOnce(abortError);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <DataProvider>
                <TestComponent />
            </DataProvider>
        );

        await waitFor(() => {
            expect(errorSpy).not.toHaveBeenCalled();
        });

        errorSpy.mockRestore();
    });
});


