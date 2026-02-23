const router = require('express').Router();
const pool = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

// WFU campus center coordinates
const WFU_LAT = 36.1335;
const WFU_LNG = -80.2762;

// Haversine formula for distance calculation
function haversineSQL(lat, lng) {
  return `(
    3959 * acos(
      cos(radians(${lat})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(latitude))
    )
  )`;
}

// Get all restaurants within radius
router.get('/', optionalAuth, async (req, res) => {
  try {
    const radius = parseFloat(req.query.radius) || 5;
    const cuisine = req.query.cuisine;
    const price = req.query.price;
    const sort = req.query.sort || 'distance';

    let query = `
      SELECT *, ${haversineSQL(WFU_LAT, WFU_LNG)} AS distance_calc
      FROM restaurants
      WHERE ${haversineSQL(WFU_LAT, WFU_LNG)} <= $1
    `;
    const params = [radius];
    let idx = 2;

    if (cuisine) {
      query += ` AND cuisine_type = $${idx}`;
      params.push(cuisine);
      idx++;
    }
    if (price) {
      query += ` AND price_range = $${idx}`;
      params.push(price);
      idx++;
    }

    if (sort === 'rating') {
      query += ' ORDER BY avg_rating DESC, distance_calc ASC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY distance_calc ASC';
    }

    const result = await pool.query(query, params);

    // If user is authenticated, include their favorite status
    if (req.user) {
      const favResult = await pool.query(
        'SELECT restaurant_id FROM favorites WHERE student_id = $1',
        [req.user.id]
      );
      const favSet = new Set(favResult.rows.map(r => r.restaurant_id));
      result.rows.forEach(r => { r.is_favorite = favSet.has(r.id); });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Get restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get single restaurant with favorite counts
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
        ${haversineSQL(WFU_LAT, WFU_LNG)} AS distance_calc,
        (SELECT COUNT(*) FROM favorites WHERE restaurant_id = r.id) AS favorite_count,
        (SELECT COUNT(*) FROM favorites WHERE restaurant_id = r.id AND meal_type IN ('lunch', 'both')) AS lunch_count,
        (SELECT COUNT(*) FROM favorites WHERE restaurant_id = r.id AND meal_type IN ('dinner', 'both')) AS dinner_count
       FROM restaurants r WHERE r.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });

    const posts = await pool.query(
      `SELECT p.*, s.display_name AS author_name
       FROM posts p JOIN students s ON p.student_id = s.id
       WHERE p.restaurant_id = $1 ORDER BY p.created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ ...result.rows[0], recent_posts: posts.rows });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Get cuisine types
router.get('/meta/cuisines', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT cuisine_type FROM restaurants WHERE cuisine_type IS NOT NULL ORDER BY cuisine_type'
    );
    res.json(result.rows.map(r => r.cuisine_type));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cuisines' });
  }
});

module.exports = router;
