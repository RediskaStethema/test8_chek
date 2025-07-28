const axios = require('axios');

const {NotFoundError, ValidationError} = require('../utils/constants');

const notFound = (req, res, next) => {
    const err = new Error('Route Not Found');
    err.status = 404;
    next(err);
}

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        return res.status(err.status).json({error: err.message});
    }
    res.status(500).json({error: 'Internal Server Error'});
};

const getCookie = async (req, res, next) => {
    try {
        const response = await axios.get('https://api.mocki.io/v2/m7cw5k4n');
        req.cookieData = response.data.cookie;
        next();
    } catch (err) {
        console.error('Failed to fetch cookie:', err.message);

        next(err);
    }
};

module.exports = {getCookie, notFound, errorHandler};