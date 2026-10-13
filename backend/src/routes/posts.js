const express = require('express');
const pool = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, restaurant_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.*,
        s.first_name AS author_first_name,
        s.last_name AS author_last_name,
        s.email AS author_email,
        r.name AS restaurant_name,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count
    `;

    if (req.user) {
      query += `,
        EXISTS(
          SELECT 1 FROM post_likes pl
          WHERE pl.post_id = p.id AND pl.student_id = $3
        ) AS is_liked
      `;
    }

    query += `
      FROM posts p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN restaurants r ON p.restaurant_id = r.id
    `;

    const params = [parseInt(limit), offset];
    if (req.user) params.push(req.user.id);

    let paramIndex = params.length;

    if (restaurant_id) {
      paramIndex++;
      query += ` WHERE p.restaurant_id = $${paramIndex}`;
      params.push(restaurant_id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`;

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM posts';
    const countParams = [];
    if (restaurant_id) {
      countQuery += ' WHERE restaurant_id = $1';
      countParams.push(restaurant_id);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      posts: result.rows.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        rating: p.rating,
        mealType: p.meal_type,
        restaurantId: p.restaurant_id,
        restaurantName: p.restaurant_name,
        author: {
          id: p.student_id,
          firstName: p.author_first_name,
          lastName: p.author_last_name,
          email: p.author_email
        },
        likeCount: parseInt(p.like_count),
        isLiked: p.is_liked || false,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      })),
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, rating, mealType, restaurantId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `INSERT INTO posts (student_id, restaurant_id, title, content, rating, meal_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, restaurantId || null, title, content, rating || null, mealType || null]
    );

    const post = result.rows[0];

    // Fetch author info
    const authorResult = await pool.query(
      'SELECT first_name, last_name, email FROM students WHERE id = $1',
      [req.user.id]
    );
    const author = authorResult.rows[0];

    // Fetch restaurant name if applicable
    let restaurantName = null;
    if (post.restaurant_id) {
      const restResult = await pool.query('SELECT name FROM restaurants WHERE id = $1', [post.restaurant_id]);
      if (restResult.rows.length > 0) restaurantName = restResult.rows[0].name;
    }

    res.status(201).json({
      id: post.id,
      title: post.title,
      content: post.content,
      rating: post.rating,
      mealType: post.meal_type,
      restaurantId: post.restaurant_id,
      restaurantName,
      author: {
        id: req.user.id,
        firstName: author.first_name,
        lastName: author.last_name,
        email: author.email
      },
      likeCount: 0,
      isLiked: false,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like/unlike post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND student_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND student_id = $2',
        [req.params.id, req.user.id]
      );
      res.json({ liked: false });
    } else {
      await pool.query(
        'INSERT INTO post_likes (post_id, student_id) VALUES ($1, $2)',
        [req.params.id, req.user.id]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Delete post
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
