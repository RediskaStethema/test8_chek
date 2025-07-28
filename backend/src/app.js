const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const Healthrouter = require('./routes/healthchek');
const {getCookie, notFound, errorHandler} = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const app = express();
app.use(cors({origin: 'http://localhost:3000'}));
app.use(logger);
app.use(express.json());
app.use(morgan('dev'));
app.use(getCookie);
app.use('/', Healthrouter);
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('*', notFound);

app.use(errorHandler);

module.exports = app;