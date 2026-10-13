'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { restaurants as restaurantsApi } from './lib/api';
import RestaurantSidebar from './components/RestaurantSidebar';

const RestaurantMap = dynamic(() => import('./components/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-wfu-gray-800">
      <div className="text-wfu-gray-400">Loading map...</div>
    </div>
  )
});

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = useCallback(async (params = {}) => {
    try {
      const data = await restaurantsApi.list(params);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 hidden md:block">
        <RestaurantSidebar
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={setSelectedRestaurant}
          onRefresh={() => fetchRestaurants()}
        />
      </div>

      {/* Map */}
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-wfu-gray-800">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-wfu-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-wfu-gray-400">Loading restaurants...</p>
            </div>
          </div>
        ) : (
          <RestaurantMap
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
          />
        )}
      </div>

      {/* Mobile restaurant list */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-wfu-gray-800 border-t border-wfu-gray-700 max-h-48 overflow-y-auto">
        {restaurants.slice(0, 5).map(r => (
          <div
            key={r.id}
            onClick={() => setSelectedRestaurant(r)}
            className="p-3 border-b border-wfu-gray-700 flex items-center justify-between"
          >
            <div>
              <span className="text-sm font-medium text-white">{r.name}</span>
              <span className="text-xs text-wfu-gray-400 ml-2">{r.distanceMiles} mi</span>
            </div>
            {r.googleRating && (
              <span className="text-xs text-wfu-gold">{r.googleRating} ★</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
