const path = require("path");

const DATA_PATH = path.join(__dirname, '../../data/items.json');
const PORT = process.env.PORT || 3001;

class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.status = 404;
    }
}

class ValidationError extends Error {
    constructor(message = 'Invalid input') {
        super(message);
        this.status = 400;
    }
}

module.exports = {NotFoundError, ValidationError, DATA_PATH, PORT};