const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/tv', require('./tv'));

module.exports = router;