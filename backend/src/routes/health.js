const router = require('express').Router();
const pool = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      service: 'wfu-eats-api',
      version: '1.0.0'
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

module.exports = router;
