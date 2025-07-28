const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const {NotFoundError, ValidationError} = require('../utils/constants');
const {readData, writeData} = require('../utils/stats');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const data = await readData();
        const { limit, offset, q } = req.query;

        let filtered = data;

        if (q) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(q.toLowerCase())
            );
        }

        const parsedLimit = limit !== undefined ? parseInt(limit, 10) : undefined;
        const parsedOffset = offset !== undefined ? parseInt(offset, 10) : 0;

        if ((limit !== undefined && (isNaN(parsedLimit) || parsedLimit < 0)) ||
            (offset !== undefined && (isNaN(parsedOffset) || parsedOffset < 0))) {
            throw new ValidationError('Parameters "limit" and "offset" must be non-negative integers');
        }

        const total = filtered.length;

        let results = filtered;
        if (parsedLimit !== undefined) {
            results = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
        } else if (parsedOffset) {
            results = filtered.slice(parsedOffset);
        }

        res.json({ items: results, total });
    } catch (err) {
        next(err);
    }
});



router.get('/:id', async (req, res, next) => {
    try {
        const data = await readData();
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id < 0) {
            throw new ValidationError('Invalid id parameter');
        }

        const item = data.find(i => i.id === id);
        if (!item) {
            throw new NotFoundError(`Item with id=${req.params.id} not found`);
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const item = req.body;
        if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
            throw new ValidationError('The "name" field is required and must be a non-empty string.');
        }

        if (!item.category || typeof item.category !== 'string' || item.category.trim() === '') {
            throw new ValidationError('The "category" field is required and must be a non-empty string.');
        }

        if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
            throw new ValidationError('The "price" field is required and must be a non-empty string.');
        }
        const data = await readData();
        item.id = Date.now().toString();
        data.push(item);

        await writeData(data);

        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
