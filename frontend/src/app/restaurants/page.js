'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, MapPin, Star, ExternalLink } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { students as studentsApi } from '../lib/api';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await studentsApi.favorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = async (restaurantId) => {
    try {
      await studentsApi.removeFavorite(restaurantId);
      setFavorites(prev => prev.filter(f => f.id !== restaurantId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Heart size={48} className="mx-auto text-wfu-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to see your favorites</h2>
        <p className="text-wfu-gray-400">Save your favorite restaurants near campus</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-wfu-gold mb-6">Your Favorites</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-wfu-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-wfu-gray-400">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 text-wfu-gray-400">
          <Heart size={48} className="mx-auto mb-4 text-wfu-gray-600" />
          <p className="text-lg">No favorites yet</p>
          <p className="mt-2">Click the heart icon on any restaurant to save it here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map(restaurant => (
            <div key={restaurant.id} className="bg-wfu-gray-800 rounded-xl p-5 border border-wfu-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{restaurant.name}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-sm text-wfu-gray-400">
                    {restaurant.cuisine && (
                      <span className="px-2 py-0.5 bg-wfu-gray-700 rounded-full text-xs">
                        {restaurant.cuisine}
                      </span>
                    )}
                    <span className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {restaurant.distanceMiles} mi
                    </span>
                    {restaurant.googleRating && (
                      <span className="flex items-center text-wfu-gold">
                        <Star size={12} className="mr-1 fill-current" />
                        {restaurant.googleRating}
                      </span>
                    )}
                  </div>
                  {restaurant.address && (
                    <p className="text-sm text-wfu-gray-400 mt-2">{restaurant.address}</p>
                  )}
                </div>

                <button
                  onClick={() => removeFavorite(restaurant.id)}
                  className="ml-3 p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Remove from favorites"
                >
                  <Heart size={20} className="fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
