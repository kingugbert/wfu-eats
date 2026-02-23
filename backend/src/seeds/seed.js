require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const restaurants = [
  {
    name: "Village Tavern",
    description: "Upscale American grill known for steaks, seafood, and a polished dining room. A Deacon favorite for special occasions.",
    address: "221 Reynolda Village, Winston-Salem, NC 27106",
    latitude: 36.1370, longitude: -80.2875,
    cuisine_type: "American", price_range: "$$$",
    phone: "(336) 748-0221", website: "https://villagetavern.com",
    image_url: "/images/village-tavern.jpg",
    hours: { mon: "11:00-21:00", tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-22:00", sat: "11:00-22:00", sun: "10:30-21:00" }
  },
  {
    name: "Primi Piatti",
    description: "Italian trattoria with handmade pastas and wood-fired pizzas. Cozy atmosphere perfect for date nights.",
    address: "116 Reynolda Village, Winston-Salem, NC 27106",
    latitude: 36.1365, longitude: -80.2870,
    cuisine_type: "Italian", price_range: "$$",
    phone: "(336) 723-1888", website: "https://primipiatti.com",
    image_url: "/images/primi-piatti.jpg",
    hours: { mon: "11:00-21:00", tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-22:00", sat: "11:00-22:00", sun: "11:00-21:00" }
  },
  {
    name: "Bib's Downtown",
    description: "North Carolina BBQ institution with pulled pork, brisket, and all the fixings. Massive portions.",
    address: "750 Old Jonestown Rd, Winston-Salem, NC 27101",
    latitude: 36.1085, longitude: -80.2605,
    cuisine_type: "BBQ", price_range: "$$",
    phone: "(336) 760-2227", website: "https://bibsdowntown.com",
    image_url: "/images/bibs.jpg",
    hours: { mon: "11:00-21:00", tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-22:00", sat: "11:00-22:00", sun: "11:00-20:00" }
  },
  {
    name: "Mellow Mushroom",
    description: "Quirky pizza chain with creative pies, craft beer on tap, and a fun, laid-back vibe. Student go-to spot.",
    address: "314 W 4th St, Winston-Salem, NC 27101",
    latitude: 36.0980, longitude: -80.2475,
    cuisine_type: "Pizza", price_range: "$$",
    phone: "(336) 245-9094", website: "https://mellowmushroom.com",
    image_url: "/images/mellow-mushroom.jpg",
    hours: { mon: "11:00-22:00", tue: "11:00-22:00", wed: "11:00-22:00", thu: "11:00-23:00", fri: "11:00-00:00", sat: "11:00-00:00", sun: "11:00-22:00" }
  },
  {
    name: "Camino Bakery",
    description: "Artisan bakery & cafe with fresh pastries, sandwiches, and excellent coffee. Great for study sessions.",
    address: "418 W 4th St, Winston-Salem, NC 27101",
    latitude: 36.0982, longitude: -80.2490,
    cuisine_type: "Cafe", price_range: "$",
    phone: "(336) 721-1818", website: "https://caminobakery.com",
    image_url: "/images/camino-bakery.jpg",
    hours: { mon: "07:00-17:00", tue: "07:00-17:00", wed: "07:00-17:00", thu: "07:00-17:00", fri: "07:00-17:00", sat: "08:00-17:00", sun: "08:00-15:00" }
  },
  {
    name: "Sweet Potatoes",
    description: "Southern soul food with a modern twist. Award-winning fried chicken and collard greens.",
    address: "529 N Trade St, Winston-Salem, NC 27101",
    latitude: 36.1005, longitude: -80.2435,
    cuisine_type: "Southern", price_range: "$$",
    phone: "(336) 727-4844", website: "https://sweetpotatoes.ws",
    image_url: "/images/sweet-potatoes.jpg",
    hours: { tue: "11:00-15:00", wed: "11:00-15:00", thu: "11:00-15:00", fri: "11:00-21:00", sat: "09:00-21:00", sun: "10:00-15:00" }
  },
  {
    name: "Bernardin's",
    description: "Fine dining in Reynolda Village. French-inspired American cuisine in an elegant setting.",
    address: "Reynolda Village, Winston-Salem, NC 27106",
    latitude: 36.1368, longitude: -80.2868,
    cuisine_type: "French-American", price_range: "$$$$",
    phone: "(336) 748-9463", website: null,
    image_url: "/images/bernardins.jpg",
    hours: { tue: "17:00-21:00", wed: "17:00-21:00", thu: "17:00-21:00", fri: "17:00-22:00", sat: "17:00-22:00" }
  },
  {
    name: "Chick-fil-A (Hanes Mall Blvd)",
    description: "Classic fast-food chicken sandwiches and nuggets. Always reliable, always packed at lunch.",
    address: "1025 Hanes Mall Blvd, Winston-Salem, NC 27103",
    latitude: 36.0870, longitude: -80.3045,
    cuisine_type: "Fast Food", price_range: "$",
    phone: "(336) 765-4533", website: "https://chick-fil-a.com",
    image_url: "/images/chick-fil-a.jpg",
    hours: { mon: "06:30-22:00", tue: "06:30-22:00", wed: "06:30-22:00", thu: "06:30-22:00", fri: "06:30-22:00", sat: "06:30-22:00" }
  },
  {
    name: "Mozelle's Fresh Southern Bistro",
    description: "Farm-to-table Southern dishes in an airy, art-filled space. Brunch is legendary.",
    address: "878 W 4th St, Winston-Salem, NC 27101",
    latitude: 36.0975, longitude: -80.2550,
    cuisine_type: "Southern", price_range: "$$$",
    phone: "(336) 703-5400", website: "https://mozelles.com",
    image_url: "/images/mozelles.jpg",
    hours: { tue: "11:00-14:30", wed: "11:00-14:30", thu: "11:00-14:30", fri: "11:00-21:00", sat: "10:00-21:00", sun: "10:00-14:30" }
  },
  {
    name: "Willowcreek Grill",
    description: "Casual American spot near campus with burgers, wraps, and great happy hour specials.",
    address: "5070 Country Club Rd, Winston-Salem, NC 27104",
    latitude: 36.1195, longitude: -80.3100,
    cuisine_type: "American", price_range: "$$",
    phone: "(336) 602-2100", website: null,
    image_url: "/images/willowcreek.jpg",
    hours: { mon: "11:00-22:00", tue: "11:00-22:00", wed: "11:00-22:00", thu: "11:00-22:00", fri: "11:00-23:00", sat: "11:00-23:00", sun: "11:00-21:00" }
  },
  {
    name: "Alma Mexicana",
    description: "Authentic Mexican cuisine with housemade salsas, fresh-squeezed margaritas, and street tacos.",
    address: "660 N Trade St, Winston-Salem, NC 27101",
    latitude: 36.1015, longitude: -80.2430,
    cuisine_type: "Mexican", price_range: "$$",
    phone: "(336) 893-5622", website: null,
    image_url: "/images/alma-mexicana.jpg",
    hours: { mon: "11:00-21:00", tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-22:00", sat: "11:00-22:00", sun: "11:00-21:00" }
  },
  {
    name: "Nawab Indian Cuisine",
    description: "Rich curries, tandoori specialties, and an excellent lunch buffet. Vegetarian-friendly.",
    address: "129 S Stratford Rd, Winston-Salem, NC 27104",
    latitude: 36.0935, longitude: -80.2810,
    cuisine_type: "Indian", price_range: "$$",
    phone: "(336) 725-3266", website: "https://nawabindiancuisine.com",
    image_url: "/images/nawab.jpg",
    hours: { mon: "11:30-14:30,17:00-21:30", tue: "11:30-14:30,17:00-21:30", wed: "11:30-14:30,17:00-21:30", thu: "11:30-14:30,17:00-21:30", fri: "11:30-14:30,17:00-22:00", sat: "11:30-22:00", sun: "11:30-21:30" }
  },
  {
    name: "Thai House Restaurant",
    description: "Traditional Thai dishes in a welcoming space. The Pad Thai and green curry are campus favorites.",
    address: "2409 Reynolda Rd, Winston-Salem, NC 27106",
    latitude: 36.1258, longitude: -80.2925,
    cuisine_type: "Thai", price_range: "$$",
    phone: "(336) 724-2882", website: null,
    image_url: "/images/thai-house.jpg",
    hours: { mon: "11:00-21:30", tue: "11:00-21:30", wed: "11:00-21:30", thu: "11:00-21:30", fri: "11:00-22:00", sat: "11:30-22:00", sun: "11:30-21:00" }
  },
  {
    name: "Chipotle (Reynolda)",
    description: "Build-your-own burritos, bowls, and tacos with quality ingredients. Quick lunch between classes.",
    address: "2127 Cloverdale Ave, Winston-Salem, NC 27103",
    latitude: 36.1100, longitude: -80.2940,
    cuisine_type: "Mexican", price_range: "$",
    phone: "(336) 721-0067", website: "https://chipotle.com",
    image_url: "/images/chipotle.jpg",
    hours: { mon: "10:45-23:00", tue: "10:45-23:00", wed: "10:45-23:00", thu: "10:45-23:00", fri: "10:45-23:00", sat: "10:45-23:00", sun: "10:45-23:00" }
  },
  {
    name: "Quarters Craft Beer & Arcade Bar",
    description: "Retro arcade games, craft beers, and comfort food. Great spot for unwinding after finals.",
    address: "748 W 4th St, Winston-Salem, NC 27101",
    latitude: 36.0978, longitude: -80.2530,
    cuisine_type: "American", price_range: "$$",
    phone: "(336) 283-0773", website: null,
    image_url: "/images/quarters.jpg",
    hours: { mon: "16:00-02:00", tue: "16:00-02:00", wed: "16:00-02:00", thu: "16:00-02:00", fri: "14:00-02:00", sat: "12:00-02:00", sun: "12:00-00:00" }
  }
];

const samplePosts = [
  { title: "Best BBQ in Winston-Salem!", body: "Bib's pulled pork is absolutely incredible. The vinegar sauce is the real deal. Went for lunch today and the line was worth every minute of the wait.", meal_type: "lunch", rating: 5, restaurant_idx: 2 },
  { title: "Study + Coffee = Camino", body: "If you need a chill spot to grind through problem sets, Camino Bakery is it. Their lavender latte is a game-changer and the pastries are fresh every morning.", meal_type: "lunch", rating: 4, restaurant_idx: 4 },
  { title: "Date night at Village Tavern", body: "Took my girlfriend to Village Tavern for our anniversary. The filet mignon was cooked perfectly, and the atmosphere in Reynolda Village is unbeatable. Definitely splurge-worthy.", meal_type: "dinner", rating: 5, restaurant_idx: 0 },
  { title: "Thai House is underrated", body: "Everybody talks about the same spots but Thai House on Reynolda has some of the best Pad Thai I have had outside of an actual Thai restaurant. The green curry is also insane. Give it a try!", meal_type: "dinner", rating: 5, restaurant_idx: 12 },
  { title: "Mellow Mushroom after the game", body: "Nothing beats heading to Mellow Mushroom after a Deacon W. The Holy Shiitake pie is incredible and they always have great local beers on tap.", meal_type: "dinner", rating: 4, restaurant_idx: 3 },
  { title: "Sweet Potatoes for brunch", body: "Finally tried the brunch at Sweet Potatoes on Saturday. The fried chicken and waffles lived up to the hype. Get there early because it fills up fast.", meal_type: "lunch", rating: 5, restaurant_idx: 5 },
  { title: "Quick lunch at Chipotle", body: "Sometimes you just need a fast, reliable burrito bowl between classes. The Chipotle on Cloverdale is close enough to campus and always consistent.", meal_type: "lunch", rating: 3, restaurant_idx: 13 },
  { title: "Mozelle's brunch is elite", body: "Took my parents to Mozelle's when they visited and they could not stop talking about the shrimp and grits. The space is gorgeous too with all the local art.", meal_type: "lunch", rating: 5, restaurant_idx: 8 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM post_likes');
    await client.query('DELETE FROM posts');
    await client.query('DELETE FROM favorites');
    await client.query('DELETE FROM restaurants');
    await client.query('DELETE FROM students');

    // Insert restaurants
    const restaurantIds = [];
    for (const r of restaurants) {
      const result = await client.query(
        `INSERT INTO restaurants (name, description, address, latitude, longitude, cuisine_type, price_range, phone, website, hours, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [r.name, r.description, r.address, r.latitude, r.longitude, r.cuisine_type, r.price_range, r.phone, r.website, JSON.stringify(r.hours), r.image_url]
      );
      restaurantIds.push(result.rows[0].id);
    }

    // Insert demo students
    const hash = await bcrypt.hash('DeaconEats2024!', 12);
    const demoStudents = [
      { email: 'demo@wfu.edu', name: 'Demo Deacon', year: 2026, major: 'Computer Science' },
      { email: 'jane.smith@wfu.edu', name: 'Jane Smith', year: 2025, major: 'Business' },
      { email: 'mike.jones@wfu.edu', name: 'Mike Jones', year: 2027, major: 'Biology' },
    ];

    const studentIds = [];
    for (const s of demoStudents) {
      const result = await client.query(
        `INSERT INTO students (email, password_hash, display_name, class_year, major)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [s.email, hash, s.name, s.year, s.major]
      );
      studentIds.push(result.rows[0].id);
    }

    // Insert favorites
    const favPairs = [
      [0, 0, 'dinner'], [0, 2, 'lunch'], [0, 4, 'lunch'], [0, 12, 'dinner'],
      [1, 0, 'both'], [1, 3, 'dinner'], [1, 5, 'lunch'],
      [2, 2, 'lunch'], [2, 7, 'lunch'], [2, 14, 'dinner'],
    ];
    for (const [si, ri, mt] of favPairs) {
      await client.query(
        'INSERT INTO favorites (student_id, restaurant_id, meal_type) VALUES ($1,$2,$3)',
        [studentIds[si], restaurantIds[ri], mt]
      );
    }

    // Insert posts
    for (let i = 0; i < samplePosts.length; i++) {
      const p = samplePosts[i];
      const sid = studentIds[i % studentIds.length];
      await client.query(
        `INSERT INTO posts (student_id, restaurant_id, title, body, meal_type, rating, likes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [sid, restaurantIds[p.restaurant_idx], p.title, p.body, p.meal_type, p.rating, Math.floor(Math.random() * 15)]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded: ${restaurants.length} restaurants, ${demoStudents.length} students, ${samplePosts.length} posts`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
