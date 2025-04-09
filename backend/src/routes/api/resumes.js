const express = require('express');
const router = express.Router();
const resumeController = require('../../controllers/resumeController');

router.get('/:id', resumeController.getResume);

// 上传简历
router.post('/upload', resumeController.uploadResume);

module.exports = router;