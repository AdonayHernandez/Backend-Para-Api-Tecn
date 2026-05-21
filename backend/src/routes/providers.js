const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProvider);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.patch('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

module.exports = router;
