const express = require('express');
const router = express.Router();
require('dotenv').config();

router.use(`/api/${process.env.API_VERSION}`, require('./api'));

module.exports = router;