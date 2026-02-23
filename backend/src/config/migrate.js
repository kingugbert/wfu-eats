require('dotenv').config();
const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // -----------------------------------------------------------------------
    // Students table
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name  VARCHAR(100) NOT NULL,
        class_year    INTEGER CHECK (class_year >= 2020 AND class_year <= 2035),
        major         VARCHAR(150),
        avatar_url    VARCHAR(512),
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // -----------------------------------------------------------------------
    // Restaurants table
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(200) NOT NULL,
        description   TEXT,
        address       VARCHAR(400) NOT NULL,
        latitude      DECIMAL(10, 7) NOT NULL,
        longitude     DECIMAL(10, 7) NOT NULL,
        cuisine_type  VARCHAR(100),
        price_range   VARCHAR(10) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
        phone         VARCHAR(30),
        website       VARCHAR(512),
        hours         JSONB,
        image_url     VARCHAR(512),
        avg_rating    DECIMAL(2, 1) DEFAULT 0.0,
        review_count  INTEGER DEFAULT 0,
        distance_miles DECIMAL(4, 2),
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // -----------------------------------------------------------------------
    // Favorites (join table)
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
        meal_type     VARCHAR(20) CHECK (meal_type IN ('lunch', 'dinner', 'both')),
        notes         TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(student_id, restaurant_id)
      );
    `);

    // -----------------------------------------------------------------------
    // Posts (blog)
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
        title         VARCHAR(300) NOT NULL,
        body          TEXT NOT NULL,
        image_url     VARCHAR(512),
        meal_type     VARCHAR(20) CHECK (meal_type IN ('lunch', 'dinner', 'snack')),
        rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
        likes         INTEGER DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // -----------------------------------------------------------------------
    // Post likes
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, student_id)
      );
    `);

    // -----------------------------------------------------------------------
    // Indexes
    // -----------------------------------------------------------------------
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_restaurants_location
        ON restaurants (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_favorites_student
        ON favorites (student_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created
        ON posts (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_student
        ON posts (student_id);
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
