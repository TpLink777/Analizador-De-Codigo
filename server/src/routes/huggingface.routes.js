const express = require('express');
const router = express.Router();
const AnalyzeCodeController = require('../controllers/response.controller')

router.post('/analyze', AnalyzeCodeController.analizarYresponder);

module.exports = router;
