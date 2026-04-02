const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { searchFoods, createCustomFood } = require('../controllers/foodController');

const router = Router();

router.use(authenticate);
router.get('/search', searchFoods);
router.post('/custom', createCustomFood);

module.exports = router;
