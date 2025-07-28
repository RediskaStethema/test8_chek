const express = require('express');
const {readData, mean} = require('../utils/stats');
const {getStats} = require('../utils/stats');
const router = express.Router();

// GET /api/stats
router.get('/', async (req, res, next) => {
    try {
        const stats = await getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

module.exports = router;