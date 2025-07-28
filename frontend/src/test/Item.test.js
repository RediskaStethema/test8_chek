import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Items from '../pages/Items';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Мокаем useData
jest.mock('../state/DataContext', () => ({
    useData: () => ({
        items: mockItems,
        fetchItems: mockFetchItems,
        totalCount: mockItems.length,
    }),
}));

let mockItems = [];
const mockFetchItems = jest.fn();

beforeEach(() => {
    mockItems = [];
    mockFetchItems.mockReset();
});

describe('Items', () => {
    it('shows loading state initially', async () => {
        mockItems = [];
        mockFetchItems.mockResolvedValue();

        render(
            <MemoryRouter>
                <Items />
            </MemoryRouter>
        );

        expect(await screen.findByText('Loading...')).toBeInTheDocument();
    });

    it('shows error when fetch fails', async () => {
        mockItems = [];
        mockFetchItems.mockRejectedValue(new Error('Some error'));

        render(
            <MemoryRouter>
                <Items />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Error of data loading');
        });
    });

    it('renders item list after fetch', async () => {
        mockItems = [
            { id: 1, name: 'Phone', category: 'Electronics', price: 100 },
            { id: 2, name: 'Book', category: 'Books', price: 20 },
        ];
        mockFetchItems.mockResolvedValue();

        render(
            <MemoryRouter>
                <Items />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Phone')).toBeInTheDocument();
            expect(screen.getByText('Book')).toBeInTheDocument();
        });

        // Точное сравнение через кастомную функцию
        expect(
            screen.getByText((_, el) => el?.textContent === 'Category: Electronics')
        ).toBeInTheDocument();
        expect(
            screen.getByText((_, el) => el?.textContent === 'Category: Books')
        ).toBeInTheDocument();

        expect(
            screen.getByText((_, el) => el?.textContent === 'Price: $100')
        ).toBeInTheDocument();
        expect(
            screen.getByText((_, el) => el?.textContent === 'Price: $20')
        ).toBeInTheDocument();
    });

    it('filters results by search input', async () => {
        mockItems = [
            { id: 1, name: 'Phone', category: 'Electronics', price: 100 },
            { id: 2, name: 'Book', category: 'Books', price: 20 },
        ];
        mockFetchItems.mockResolvedValue();

        render(
            <MemoryRouter>
                <Items />
            </MemoryRouter>
        );

        const input = screen.getByLabelText('Search Items');
        fireEvent.change(input, { target: { value: 'Phone' } });

        await waitFor(() => {
            expect(mockFetchItems).toHaveBeenCalledWith(
                expect.objectContaining({ q: 'Phone' })
            );
        });
    });
});

