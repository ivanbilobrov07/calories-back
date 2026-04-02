const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getLogs, createLog, updateLog, deleteLog } = require('../controllers/logController');

const router = Router();

router.use(authenticate);
router.get('/', getLogs);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;
