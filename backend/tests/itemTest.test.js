const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');
const { readData, writeData } = require('../src/utils/stats');

jest.mock('../src/utils/stats');

const app = require('../src/app');
app.use(express.json());
app.use('/api/items', itemsRouter);

// Моковые данные
const mockItems = [
    { id: 1, name: 'Apple', category: 'Fruit', price: 10 },
    { id: 2, name: 'Banana', category: 'Fruit', price: 20 },
    { id: 3, name: 'Orange', category: 'Fruit', price: 30 },
    { id: 4, name: 'Mango', category: 'Tropical', price: 15 }
];

describe('Items API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // === GET /api/items ===
    describe('GET /api/items', () => {
        it('returns all items', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items');
            expect(res.status).toBe(200);
            expect(res.body.items).toEqual(mockItems);
            expect(res.body.total).toBe(mockItems.length);
        });

        it('filters items by query parameter q', async () => {
            readData.mockResolvedValue(mockItems);
            const res = await request(app).get('/api/items').query({ q: 'an' });

            const expected = [
                { id: 2, name: 'Banana', category: 'Fruit', price: 20 },
                { id: 3, name: 'Orange', category: 'Fruit', price: 30 },
                { id: 4, name: 'Mango', category: 'Tropical', price: 15 }
            ];

            expect(res.status).toBe(200);
            expect(res.body.items).toEqual(expected);
            expect(res.body.total).toBe(expected.length);
        });

        it('limits results with limit parameter', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items').query({ limit: 2 });
            expect(res.status).toBe(200);
            expect(res.body.items).toEqual(mockItems.slice(0, 2));
        });

        it('applies offset parameter', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items').query({ offset: 2 });
            expect(res.status).toBe(200);
            expect(res.body.items).toEqual(mockItems.slice(2));
        });

        it('combines filtering, offset, and limit', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app)
                .get('/api/items')
                .query({ q: 'a', offset: 1, limit: 2 });

            const filtered = mockItems.filter(i =>
                i.name.toLowerCase().includes('a')
            );

            expect(res.status).toBe(200);
            expect(res.body.items).toEqual(filtered.slice(1, 3));
        });

        it('returns 400 error for invalid limit', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items?limit=-10');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('returns 400 error for invalid offset', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items?offset=-1');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('returns 500 error if reading data fails', async () => {
            readData.mockRejectedValue(new Error('Read error'));

            const res = await request(app).get('/api/items');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    // === GET /api/items/:id ===
    describe('GET /api/items/:id', () => {
        it('returns item by id', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items/2');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockItems[1]);
        });

        it('returns 400 error for invalid id', async () => {
            const res = await request(app).get('/api/items/abc');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('returns 404 error if item not found', async () => {
            readData.mockResolvedValue(mockItems);

            const res = await request(app).get('/api/items/999');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
        });

        it('returns 500 error if reading data fails', async () => {
            readData.mockRejectedValue(new Error('Read fail'));

            const res = await request(app).get('/api/items/1');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    // === POST /api/items ===
    describe('POST /api/items', () => {
        it('creates a new item with valid data', async () => {
            readData.mockResolvedValue(mockItems);
            writeData.mockResolvedValue();

            const newItem = {
                name: 'Pineapple',
                category: 'Fruit',
                price: 50
            };

            const res = await request(app).post('/api/items').send(newItem);
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject(newItem);
            expect(res.body).toHaveProperty('id');
        });

        it('returns 400 error when name field is missing or empty', async () => {
            const badInputs = [{}, { name: '' }, { name: '   ' }, { name: 123 }];

            for (const body of badInputs) {
                const res = await request(app).post('/api/items').send(body);
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            }
        });

        it('returns 400 error when category field is missing or invalid', async () => {
            const invalids = [
                { name: 'Pear', price: 20 },
                { name: 'Pear', category: '', price: 20 },
                { name: 'Pear', category: 123, price: 20 },
            ];

            for (const body of invalids) {
                const res = await request(app).post('/api/items').send(body);
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            }
        });

        it('returns 400 error when price field is missing or invalid', async () => {
            const invalids = [
                { name: 'Pear', category: 'Fruit' },
                { name: 'Pear', category: 'Fruit', price: -5 },
                { name: 'Pear', category: 'Fruit', price: 'abc' },
            ];

            for (const body of invalids) {
                const res = await request(app).post('/api/items').send(body);
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            }
        });

        it('returns 500 error if writing data fails', async () => {
            readData.mockResolvedValue(mockItems);
            writeData.mockRejectedValue(new Error('Write error'));

            const newItem = {
                name: 'Pear',
                category: 'Fruit',
                price: 20
            };

            const res = await request(app).post('/api/items').send(newItem);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });
});



