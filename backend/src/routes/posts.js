const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get all posts (blog feed)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, s.display_name AS author_name, s.avatar_url AS author_avatar,
              r.name AS restaurant_name, r.cuisine_type
       FROM posts p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN restaurants r ON p.restaurant_id = r.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countResult.rows[0].count);

    // Include whether the current user has liked each post
    if (req.user) {
      const likeResult = await pool.query(
        'SELECT post_id FROM post_likes WHERE student_id = $1',
        [req.user.id]
      );
      const likedSet = new Set(likeResult.rows.map(r => r.post_id));
      result.rows.forEach(p => { p.has_liked = likedSet.has(p.id); });
    }

    res.json({
      posts: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, body, restaurantId, imageUrl, mealType, rating } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const result = await pool.query(
      `INSERT INTO posts (student_id, restaurant_id, title, body, image_url, meal_type, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, restaurantId || null, title, body, imageUrl || null, mealType || null, rating || null]
    );

    // Fetch with author info
    const post = await pool.query(
      `SELECT p.*, s.display_name AS author_name, s.avatar_url AS author_avatar,
              r.name AS restaurant_name
       FROM posts p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN restaurants r ON p.restaurant_id = r.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(post.rows[0]);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like / unlike a post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND student_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND student_id = $2',
        [req.params.id, req.user.id]);
      await pool.query('UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1', [req.params.id]);
      res.json({ liked: false });
    } else {
      // Like
      await pool.query('INSERT INTO post_likes (post_id, student_id) VALUES ($1, $2)',
        [req.params.id, req.user.id]);
      await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [req.params.id]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Delete own post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND student_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or not authorized' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
