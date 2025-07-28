const express = require("express");


const Healthrouter = express.Router();
Healthrouter.get("/", (req, res) => {
    res.json({status: 'OK', message: 'Server is running'})
})

module.exports = Healthrouter