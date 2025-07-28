const request = require('supertest');
const app = require('../src/app'); // путь до express app
const {getStats} = require('../src/utils/stats');

jest.mock('../src/utils/stats'); // мок всей утилиты

describe('GET /api/stats', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('должен вернуть правильную статистику', async () => {
        getStats.mockResolvedValue({
            total: 3,
            averagePrice: 20
        });

        const res = await request(app).get('/api/stats');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            total: 3,
            averagePrice: 20
        });
    });

    it('должен вернуть 500 при ошибке в getStats', async () => {
        getStats.mockRejectedValue(new Error('Что-то пошло не так'));

        const res = await request(app).get('/api/stats');

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error'); // убедись, что errorHandler его формирует
    });
});
