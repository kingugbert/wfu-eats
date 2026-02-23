'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { restaurants as restaurantApi, students as studentApi } from './lib/api';
import { useAuth } from './components/AuthContext';
import RestaurantSidebar from './components/RestaurantSidebar';

// Dynamic import Leaflet (no SSR)
const RestaurantMap = dynamic(() => import('./components/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-wfu-gray-800 rounded-xl flex items-center justify-center">
      <div className="text-wfu-gold animate-pulse">Loading map...</div>
    </div>
  ),
});

export default function HomePage() {
  const { user } = useAuth();
  const [restaurantList, setRestaurantList] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params = { radius: '5' };
      if (cuisineFilter) params.cuisine = cuisineFilter;
      const data = await restaurantApi.list(params);
      setRestaurantList(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, [cuisineFilter]);

  useEffect(() => {
    fetchRestaurants();
    restaurantApi.cuisines().then(setCuisines).catch(() => {});
  }, [fetchRestaurants]);

  // Refetch when user changes (to get favorite status)
  useEffect(() => { fetchRestaurants(); }, [user, fetchRestaurants]);

  const handleSelect = (restaurant) => {
    setSelectedId(restaurant.id);
  };

  const handleToggleFavorite = async (restaurant) => {
    if (!user) return;
    try {
      if (restaurant.is_favorite) {
        await studentApi.removeFavorite(restaurant.id);
      } else {
        await studentApi.addFavorite({ restaurantId: restaurant.id, mealType: 'both' });
      }
      fetchRestaurants();
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-96 bg-wfu-gray-800 border-r border-wfu-gray-700
                      overflow-hidden flex flex-col h-64 lg:h-full">
        <RestaurantSidebar
          restaurants={restaurantList}
          selectedId={selectedId}
          onSelect={handleSelect}
          onToggleFavorite={handleToggleFavorite}
          cuisineFilter={cuisineFilter}
          setCuisineFilter={setCuisineFilter}
          cuisines={cuisines}
        />
      </div>

      {/* Map */}
      <div className="flex-1 p-3 lg:p-4">
        <RestaurantMap
          restaurants={restaurantList}
          selectedId={selectedId}
          onSelectRestaurant={handleSelect}
        />
      </div>
    </div>
  );
}
