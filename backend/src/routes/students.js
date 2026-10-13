const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get favorites
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, f.created_at AS favorited_at,
        (3959 * acos(
          cos(radians(36.1335)) * cos(radians(r.latitude)) *
          cos(radians(r.longitude) - radians(-80.2762)) +
          sin(radians(36.1335)) * sin(radians(r.latitude))
        )) AS distance_miles
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.student_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      cuisine: r.cuisine,
      priceRange: r.price_range,
      description: r.description,
      googleRating: r.google_rating ? parseFloat(r.google_rating) : null,
      googlePhotoRef: r.google_photo_ref,
      distanceMiles: parseFloat(parseFloat(r.distance_miles).toFixed(2)),
      isFavorite: true,
      favoritedAt: r.favorited_at
    })));
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite
router.post('/favorites/:restaurantId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO favorites (student_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.restaurantId]
    );
    res.status(201).json({ message: 'Added to favorites' });
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
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
