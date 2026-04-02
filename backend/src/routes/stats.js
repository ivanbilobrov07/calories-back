const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getWeeklyStats } = require('../controllers/statsController');

const router = Router();

router.use(authenticate);
router.get('/weekly', getWeeklyStats);

module.exports = router;
