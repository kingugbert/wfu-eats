const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Helper: check if a column exists in a table
    const columnExists = async (table, column) => {
      const res = await client.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
        [table, column]
      );
      return res.rows.length > 0;
    };

    // Students table — drop and recreate if old schema detected
    const hasStudentsTable = (await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'students'`
    )).rows.length > 0;

    if (hasStudentsTable) {
      const hasFirstName = await columnExists('students', 'first_name');
      const hasDisplayName = await columnExists('students', 'display_name');
      if (!hasFirstName || hasDisplayName) {
        // Old schema — drop dependent tables first, then recreate
        console.log('Detected old students schema, recreating...');
        await client.query('DROP TABLE IF EXISTS post_likes CASCADE');
        await client.query('DROP TABLE IF EXISTS posts CASCADE');
        await client.query('DROP TABLE IF EXISTS favorites CASCADE');
        await client.query('DROP TABLE IF EXISTS students CASCADE');
      }
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        graduation_year INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Restaurants table with Google Places fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        cuisine VARCHAR(100),
        price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
        description TEXT,
        phone VARCHAR(20),
        website VARCHAR(500),
        google_place_id VARCHAR(300) UNIQUE,
        google_rating DECIMAL(2, 1),
        google_photo_ref VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Add columns if they don't exist (for upgrades from older schema)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='cuisine') THEN
          ALTER TABLE restaurants ADD COLUMN cuisine VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='price_range') THEN
          ALTER TABLE restaurants ADD COLUMN price_range INTEGER CHECK (price_range BETWEEN 1 AND 4);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='description') THEN
          ALTER TABLE restaurants ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='phone') THEN
          ALTER TABLE restaurants ADD COLUMN phone VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='website') THEN
          ALTER TABLE restaurants ADD COLUMN website VARCHAR(500);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='google_place_id') THEN
          ALTER TABLE restaurants ADD COLUMN google_place_id VARCHAR(300) UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='google_rating') THEN
          ALTER TABLE restaurants ADD COLUMN google_rating DECIMAL(2, 1);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='google_photo_ref') THEN
          ALTER TABLE restaurants ADD COLUMN google_photo_ref VARCHAR(500);
        END IF;
      END $$;
    `);

    // Drop stray columns from restaurants that the code doesn't use
    await client.query(`
      ALTER TABLE restaurants DROP COLUMN IF EXISTS distance_miles;
    `);

    // Favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(student_id, restaurant_id)
      );
    `);

    // Posts table — check for old schema
    const hasPostsTable = (await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'posts'`
    )).rows.length > 0;

    if (hasPostsTable) {
      const hasContent = await columnExists('posts', 'content');
      if (!hasContent) {
        console.log('Detected old posts schema, recreating...');
        await client.query('DROP TABLE IF EXISTS post_likes CASCADE');
        await client.query('DROP TABLE IF EXISTS posts CASCADE');
      }
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        meal_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Post likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, student_id)
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_student ON favorites(student_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_restaurant ON favorites(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_posts_student ON posts(student_id);
      CREATE INDEX IF NOT EXISTS idx_posts_restaurant ON posts(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON restaurants(google_place_id);
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
