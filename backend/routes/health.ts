import express from 'express';

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Check server status
 */
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

export default router;
