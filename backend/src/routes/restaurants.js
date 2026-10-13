const express = require('express');
const pool = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// WFU campus center
const WFU_LAT = 36.1335;
const WFU_LNG = -80.2762;
const MAX_DISTANCE_MILES = 5;

// Get all restaurants within range
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { cuisine, price_range, sort, lat, lng, radius } = req.query;

    // Allow custom center and radius, default to WFU campus
    const centerLat = lat ? parseFloat(lat) : WFU_LAT;
    const centerLng = lng ? parseFloat(lng) : WFU_LNG;
    const maxDistance = radius ? parseFloat(radius) : MAX_DISTANCE_MILES;

    let query = `
      SELECT r.*,
        (3959 * acos(
          cos(radians($1)) * cos(radians(r.latitude)) *
          cos(radians(r.longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(r.latitude))
        )) AS distance_miles
    `;

    if (req.user) {
      query += `,
        EXISTS(
          SELECT 1 FROM favorites f
          WHERE f.restaurant_id = r.id AND f.student_id = $3
        ) AS is_favorite
      `;
    }

    query += `
      FROM restaurants r
      WHERE (3959 * acos(
        cos(radians($1)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(r.latitude))
      )) <= ${maxDistance}
    `;

    const params = [centerLat, centerLng];
    if (req.user) params.push(req.user.id);

    let paramIndex = params.length;

    if (cuisine) {
      paramIndex++;
      query += ` AND LOWER(r.cuisine) = LOWER($${paramIndex})`;
      params.push(cuisine);
    }

    if (price_range) {
      paramIndex++;
      query += ` AND r.price_range = $${paramIndex}`;
      params.push(parseInt(price_range));
    }

    if (sort === 'rating') {
      query += ` ORDER BY r.google_rating DESC NULLS LAST, distance_miles ASC`;
    } else {
      query += ` ORDER BY distance_miles ASC`;
    }

    const result = await pool.query(query, params);

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      cuisine: r.cuisine,
      priceRange: r.price_range,
      description: r.description,
      phone: r.phone,
      website: r.website,
      googlePlaceId: r.google_place_id,
      googleRating: r.google_rating ? parseFloat(r.google_rating) : null,
      googlePhotoRef: r.google_photo_ref,
      distanceMiles: parseFloat(parseFloat(r.distance_miles).toFixed(2)),
      isFavorite: r.is_favorite || false
    })));
  } catch (err) {
    console.error('Get restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get single restaurant
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let query = `
      SELECT r.*,
        (3959 * acos(
          cos(radians($1)) * cos(radians(r.latitude)) *
          cos(radians(r.longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(r.latitude))
        )) AS distance_miles
    `;

    if (req.user) {
      query += `,
        EXISTS(
          SELECT 1 FROM favorites f
          WHERE f.restaurant_id = r.id AND f.student_id = $4
        ) AS is_favorite
      `;
    }

    query += ` FROM restaurants r WHERE r.id = $3`;

    const params = [WFU_LAT, WFU_LNG, req.params.id];
    if (req.user) params.push(req.user.id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      cuisine: r.cuisine,
      priceRange: r.price_range,
      description: r.description,
      phone: r.phone,
      website: r.website,
      googlePlaceId: r.google_place_id,
      googleRating: r.google_rating ? parseFloat(r.google_rating) : null,
      googlePhotoRef: r.google_photo_ref,
      distanceMiles: parseFloat(parseFloat(r.distance_miles).toFixed(2)),
      isFavorite: r.is_favorite || false
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Get cuisines
router.get('/meta/cuisines', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT cuisine FROM restaurants WHERE cuisine IS NOT NULL ORDER BY cuisine`
    );
    res.json(result.rows.map(r => r.cuisine));
  } catch (err) {
    console.error('Get cuisines error:', err);
    res.status(500).json({ error: 'Failed to fetch cuisines' });
  }
});

module.exports = router;
