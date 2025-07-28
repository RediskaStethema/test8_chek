import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ItemDetail from '../pages/ItemDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

// Мокаем useNavigate и useParams из react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
    useParams: () => ({ id: '1' }),
}));

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('ItemDetail', () => {
    it('shows skeleton loaders while fetching data', () => {
        fetch.mockImplementation(() => new Promise(() => {})); // бесконечная загрузка

        render(
            <MemoryRouter initialEntries={['/items/1']}>
                <Routes>
                    <Route path="/items/:id" element={<ItemDetail />} />
                </Routes>
            </MemoryRouter>
        );

        // Ожидаем скелетоны с data-testid
        const skeletons = screen.getAllByTestId('skeleton');
        expect(skeletons.length).toBe(3);
    });

    it('displays item data after successful fetch', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 1,
                category: 'Electronics',
                price: 123,
            }),
        });

        render(
            <MemoryRouter initialEntries={['/items/1']}>
                <Routes>
                    <Route path="/items/:id" element={<ItemDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument();

            expect(
                screen.getByText((content, element) =>
                    element?.textContent === 'Category: Electronics'
                )
            ).toBeInTheDocument();

            expect(
                screen.getByText((content, element) =>
                    element?.textContent === 'Price: $123'
                )
            ).toBeInTheDocument();
        });
    });

    it('shows error message and Back button when fetch fails', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
        });

        render(
            <MemoryRouter initialEntries={['/items/1']}>
                <Routes>
                    <Route path="/items/:id" element={<ItemDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Item not found');
            expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
});


