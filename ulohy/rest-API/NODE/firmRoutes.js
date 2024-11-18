const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firmController');

router.get('/list', firmController.listFirms);
router.post('/save', firmController.saveFirm);
router.put('/:id', firmController.updateFirm);
router.delete('/:id', firmController.deleteFirm);
router.post('/:id/contacts/save', firmController.saveContact);

module.exports = router;
