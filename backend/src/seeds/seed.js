const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed restaurants (these will be supplemented by Google Places sync)
    const restaurants = [
      { name: 'Village Tavern', address: '221 Reynolda Village, Winston-Salem, NC 27106', lat: 36.1340, lng: -80.2870, cuisine: 'American', price: 3, desc: 'Upscale casual dining near Reynolda Village' },
      { name: 'Camino Bakery', address: '102 W 4th St, Winston-Salem, NC 27101', lat: 36.0972, lng: -80.2451, cuisine: 'Bakery', price: 1, desc: 'Artisan bakery and coffee shop downtown' },
      { name: 'Sweet Potatoes', address: '529 N Trade St, Winston-Salem, NC 27101', lat: 36.1005, lng: -80.2445, cuisine: 'Southern', price: 2, desc: 'Southern comfort food in the Arts District' },
      { name: 'Meridian', address: '367 Knollwood St, Winston-Salem, NC 27103', lat: 36.1174, lng: -80.2930, cuisine: 'American', price: 3, desc: 'Farm-to-table with seasonal menu' },
      { name: 'Mozzarella Fellas', address: '100 S Stratford Rd, Winston-Salem, NC 27103', lat: 36.1089, lng: -80.2876, cuisine: 'Pizza', price: 1, desc: 'NY-style pizza by the slice' },
      { name: 'Real Q', address: '2730 Reynolda Rd, Winston-Salem, NC 27106', lat: 36.1411, lng: -80.2984, cuisine: 'BBQ', price: 2, desc: 'Authentic pit-smoked BBQ' },
      { name: 'Bib Gourmand', address: '499 N Patterson Ave, Winston-Salem, NC 27101', lat: 36.1044, lng: -80.2503, cuisine: 'French', price: 3, desc: 'French-inspired bistro cuisine' },
      { name: 'Alma Mexican Kitchen', address: '116 Reynolda Village, Winston-Salem, NC 27106', lat: 36.1338, lng: -80.2862, cuisine: 'Mexican', price: 2, desc: 'Authentic Mexican near campus' },
      { name: 'Spring House', address: '901 Reynolda Rd, Winston-Salem, NC 27104', lat: 36.1225, lng: -80.2833, cuisine: 'American', price: 3, desc: 'Historic restaurant with seasonal menus' },
      { name: 'Nawab Indian Cuisine', address: '129 S Stratford Rd, Winston-Salem, NC 27103', lat: 36.1078, lng: -80.2880, cuisine: 'Indian', price: 2, desc: 'Traditional Indian dishes and buffet' },
      { name: 'Pho Viet', address: '2655 Reynolda Rd, Winston-Salem, NC 27106', lat: 36.1400, lng: -80.2970, cuisine: 'Vietnamese', price: 1, desc: 'Vietnamese pho and banh mi' },
      { name: 'Elizabeth\'s Pizza', address: '2942 Reynolda Rd, Winston-Salem, NC 27106', lat: 36.1440, lng: -80.3010, cuisine: 'Italian', price: 2, desc: 'Italian-American classics and pizza' },
      { name: 'Cagney\'s Kitchen', address: '2112 Reynolda Rd, Winston-Salem, NC 27104', lat: 36.1275, lng: -80.2800, cuisine: 'Breakfast', price: 1, desc: 'Classic breakfast and brunch spot' },
      { name: 'Taco Bell Cantina', address: '400 S Stratford Rd, Winston-Salem, NC 27103', lat: 36.1020, lng: -80.2890, cuisine: 'Fast Food', price: 1, desc: 'Late-night Tex-Mex' },
      { name: 'Mission Pizza', address: '615 S Stratford Rd, Winston-Salem, NC 27103', lat: 36.0978, lng: -80.2900, cuisine: 'Pizza', price: 2, desc: 'Wood-fired Neapolitan pizza' }
    ];

    for (const r of restaurants) {
      await client.query(
        `INSERT INTO restaurants (name, address, latitude, longitude, cuisine, price_range, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [r.name, r.address, r.lat, r.lng, r.cuisine, r.price, r.desc]
      );
    }

    // Seed demo students
    const passwordHash = await bcrypt.hash('DeaconEats2024!', 12);
    const students = [
      { email: 'demo.deac@wfu.edu', first: 'Demo', last: 'Deacon', year: 2025 },
      { email: 'jane.smith@wfu.edu', first: 'Jane', last: 'Smith', year: 2026 },
      { email: 'john.doe@wfu.edu', first: 'John', last: 'Doe', year: 2025 }
    ];

    const studentIds = [];
    for (const s of students) {
      const result = await client.query(
        `INSERT INTO students (email, password_hash, first_name, last_name, graduation_year)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
         RETURNING id`,
        [s.email, passwordHash, s.first, s.last, s.year]
      );
      studentIds.push(result.rows[0].id);
    }

    // Get restaurant IDs for posts
    const restResult = await client.query('SELECT id, name FROM restaurants ORDER BY name LIMIT 10');
    const restIds = restResult.rows;

    // Seed posts
    const posts = [
      { student: 0, rest: 0, title: 'Best burger near campus!', content: 'The Village Tavern burger is absolutely incredible. The patty is thick, juicy, and cooked perfectly. Highly recommend the sweet potato fries as a side. Great spot for a Friday dinner after a long week of classes.', rating: 5, meal: 'Dinner' },
      { student: 1, rest: 2, title: 'Southern comfort at its finest', content: 'Sweet Potatoes never disappoints! The fried chicken is crispy on the outside and tender inside. The mac and cheese is the real deal. Perfect for when you miss home cooking.', rating: 5, meal: 'Lunch' },
      { student: 2, rest: 1, title: 'Morning study fuel', content: 'Camino Bakery has become my go-to study spot. Their pour-over coffee is excellent and the pastries are freshly baked every morning. The atmosphere is perfect for getting work done.', rating: 4, meal: 'Breakfast' },
      { student: 0, rest: 4, title: 'Late night pizza run', content: 'After a late night study session at the Z Smith, nothing hits like Mozzarella Fellas. Their NY-style slices are huge and affordable. The pepperoni is my go-to order.', rating: 4, meal: 'Late Night' },
      { student: 1, rest: 5, title: 'BBQ worth the drive', content: 'Real Q has the best brisket in Winston-Salem, hands down. The meat is smoked for hours and just falls apart. Their sauce selection is on point too. Go hungry!', rating: 5, meal: 'Lunch' },
      { student: 2, rest: 7, title: 'Taco Tuesday favorite', content: 'Alma Mexican Kitchen does Taco Tuesday right. Authentic flavors, generous portions, and great prices for students. The street tacos with cilantro and onion are *chef\'s kiss*.', rating: 4, meal: 'Dinner' },
      { student: 0, rest: 9, title: 'Hidden gem for Indian food', content: 'Nawab has an incredible lunch buffet. For under $15, you get unlimited naan, rice, and a rotating selection of curries. The butter chicken is consistently great.', rating: 4, meal: 'Lunch' },
      { student: 1, rest: 3, title: 'Special occasion spot', content: 'Took my parents to Meridian when they visited for Family Weekend. The farm-to-table concept really shines here. Every dish was beautifully presented and delicious. A bit pricey but worth it for a special meal.', rating: 5, meal: 'Dinner' }
    ];

    for (const p of posts) {
      if (restIds[p.rest]) {
        await client.query(
          `INSERT INTO posts (student_id, restaurant_id, title, content, rating, meal_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [studentIds[p.student], restIds[p.rest].id, p.title, p.content, p.rating, p.meal]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully');
    console.log(`  - ${restaurants.length} restaurants`);
    console.log(`  - ${students.length} students (password: DeaconEats2024!)`);
    console.log(`  - ${posts.length} posts`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
