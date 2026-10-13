const express = require('express');
const https = require('https');
const pool = require('../config/db');

const router = express.Router();

const WFU_LAT = 36.1335;
const WFU_LNG = -80.2762;
const RADIUS_METERS = 8047; // ~5 miles

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] }));
    }).on('error', reject);
  });
}

// Map Google price_level to our 1-4 range
function mapPriceLevel(priceLevel) {
  const map = {
    'PRICE_LEVEL_FREE': 1,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4
  };
  return map[priceLevel] || 2;
}

// Extract primary cuisine from Google types
function extractCuisine(types) {
  if (!types || types.length === 0) return 'Restaurant';

  const cuisineMap = {
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'italian_restaurant': 'Italian',
    'mexican_restaurant': 'Mexican',
    'indian_restaurant': 'Indian',
    'thai_restaurant': 'Thai',
    'korean_restaurant': 'Korean',
    'vietnamese_restaurant': 'Vietnamese',
    'greek_restaurant': 'Greek',
    'mediterranean_restaurant': 'Mediterranean',
    'american_restaurant': 'American',
    'french_restaurant': 'French',
    'seafood_restaurant': 'Seafood',
    'steak_house': 'Steakhouse',
    'sushi_restaurant': 'Japanese',
    'pizza_restaurant': 'Pizza',
    'hamburger_restaurant': 'Burgers',
    'sandwich_shop': 'Sandwiches',
    'ice_cream_shop': 'Desserts',
    'coffee_shop': 'Coffee',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
    'bar': 'Bar & Grill',
    'barbecue_restaurant': 'BBQ',
    'breakfast_restaurant': 'Breakfast',
    'brunch_restaurant': 'Brunch',
    'fast_food_restaurant': 'Fast Food',
    'meal_takeaway': 'Takeout',
    'meal_delivery': 'Delivery'
  };

  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type];
  }

  return 'Restaurant';
}

// Helper: call Google Places searchNearby for a single type
function searchNearby(apiKey, type, centerLat, centerLng, radiusMeters) {
  const requestBody = JSON.stringify({
    includedTypes: [type],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: centerLat, longitude: centerLng },
        radius: radiusMeters
      }
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'places.googleapis.com',
      path: '/v1/places:searchNearby',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.priceLevel,places.nationalPhoneNumber,places.websiteUri,places.photos,places.editorialSummary'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse Google response'));
        }
      });
    });
    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Upsert a single place into the restaurants table
async function upsertPlace(place) {
  const name = place.displayName?.text || 'Unknown';
  const address = place.formattedAddress || '';
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const googlePlaceId = place.id;
  const rating = place.rating || null;
  const priceRange = mapPriceLevel(place.priceLevel);
  const cuisine = extractCuisine(place.types);
  const phone = place.nationalPhoneNumber || null;
  const website = place.websiteUri || null;
  const description = place.editorialSummary?.text || null;
  const photoRef = place.photos?.[0]?.name || null;

  if (!lat || !lng || !googlePlaceId) return false;

  await pool.query(
    `INSERT INTO restaurants (name, address, latitude, longitude, cuisine, price_range, description, phone, website, google_place_id, google_rating, google_photo_ref)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (google_place_id)
     DO UPDATE SET
       name = EXCLUDED.name,
       address = EXCLUDED.address,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       cuisine = EXCLUDED.cuisine,
       price_range = EXCLUDED.price_range,
       description = COALESCE(EXCLUDED.description, restaurants.description),
       phone = COALESCE(EXCLUDED.phone, restaurants.phone),
       website = COALESCE(EXCLUDED.website, restaurants.website),
       google_rating = EXCLUDED.google_rating,
       google_photo_ref = EXCLUDED.google_photo_ref,
       updated_at = NOW()`,
    [name, address, lat, lng, cuisine, priceRange, description, phone, website, googlePlaceId, rating, photoRef]
  );
  return true;
}

// Sync restaurants from Google Places API (New)
// Searches each type separately to get up to 20 results per type
router.post('/sync', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }

  try {
    const types = ['restaurant', 'cafe', 'bakery', 'meal_takeaway', 'bar',
                   'pizza_restaurant', 'hamburger_restaurant', 'sandwich_shop',
                   'ice_cream_shop', 'coffee_shop', 'fast_food_restaurant',
                   'american_restaurant', 'italian_restaurant', 'mexican_restaurant',
                   'chinese_restaurant', 'japanese_restaurant', 'seafood_restaurant',
                   'breakfast_restaurant', 'brunch_restaurant', 'steak_house'];

    const seenIds = new Set();
    let synced = 0;
    let totalFound = 0;

    // Search each type separately (each gets up to 20 results)
    for (const type of types) {
      try {
        const data = await searchNearby(apiKey, type, WFU_LAT, WFU_LNG, RADIUS_METERS);

        if (!data.places || data.places.length === 0) continue;

        totalFound += data.places.length;

        for (const place of data.places) {
          // Skip duplicates across type searches
          if (seenIds.has(place.id)) continue;
          seenIds.add(place.id);

          const ok = await upsertPlace(place);
          if (ok) synced++;
        }
      } catch (typeErr) {
        console.error(`Sync error for type ${type}:`, typeErr.message);
        // Continue with other types
      }
    }

    res.json({
      message: `Synced ${synced} unique restaurants from Google Places (${totalFound} total results across ${types.length} categories)`,
      synced,
      totalFound
    });
  } catch (err) {
    console.error('Google sync error:', err);
    res.status(500).json({ error: 'Failed to sync with Google Places' });
  }
});

// Proxy Google Place photos
router.get('/photo/:photoRef(*)', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }

  try {
    const photoRef = req.params.photoRef;
    const maxWidth = req.query.maxWidth || 400;

    const url = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;

    const { buffer, contentType } = await fetchBuffer(url);
    res.set('Content-Type', contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    console.error('Photo proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

module.exports = router;
