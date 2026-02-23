const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Get student profile with favorites
router.get('/:id', async (req, res) => {
  try {
    const student = await pool.query(
      `SELECT id, display_name, class_year, major, avatar_url, created_at
       FROM students WHERE id = $1`, [req.params.id]
    );
    if (student.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const favorites = await pool.query(
      `SELECT f.*, r.name AS restaurant_name, r.cuisine_type, r.price_range, r.image_url
       FROM favorites f JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.student_id = $1 ORDER BY f.created_at DESC`, [req.params.id]
    );

    res.json({ ...student.rows[0], favorites: favorites.rows });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Add favorite restaurant
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const { restaurantId, mealType, notes } = req.body;
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });

    const result = await pool.query(
      `INSERT INTO favorites (student_id, restaurant_id, meal_type, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, restaurant_id) DO UPDATE SET meal_type = $3, notes = $4
       RETURNING *`,
      [req.user.id, restaurantId, mealType || 'both', notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite
router.delete('/favorites/:restaurantId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE student_id = $1 AND restaurant_id = $2',
      [req.user.id, req.params.restaurantId]
    );
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Get current user's favorites
router.get('/me/favorites', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, r.name AS restaurant_name, r.cuisine_type, r.price_range,
              r.image_url, r.latitude, r.longitude, r.address
       FROM favorites f JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.student_id = $1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

module.exports = router;
