'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Star, DollarSign, Filter } from 'lucide-react';
import { useAuth } from './AuthContext';
import { students as studentsApi } from '../lib/api';

export default function RestaurantSidebar({ restaurants, selectedRestaurant, onSelectRestaurant, onRefresh }) {
  const { user } = useAuth();
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    if (restaurants) {
      const unique = [...new Set(restaurants.map(r => r.cuisine).filter(Boolean))].sort();
      setCuisines(unique);
    }
  }, [restaurants]);

  const filtered = restaurants?.filter(r =>
    !cuisineFilter || r.cuisine === cuisineFilter
  ) || [];

  const toggleFavorite = async (e, restaurant) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (restaurant.isFavorite) {
        await studentsApi.removeFavorite(restaurant.id);
      } else {
        await studentsApi.addFavorite(restaurant.id);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-wfu-gray-800 border-r border-wfu-gray-700">
      <div className="p-4 border-b border-wfu-gray-700">
        <h2 className="text-lg font-bold text-wfu-gold mb-3">Restaurants Near WFU</h2>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wfu-gray-400" />
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-wfu-gold appearance-none"
          >
            <option value="">All Cuisines</option>
            {cuisines.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mt-2 text-xs text-wfu-gray-400">
          {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(restaurant => (
          <div
            key={restaurant.id}
            onClick={() => onSelectRestaurant(restaurant)}
            className={`p-4 border-b border-wfu-gray-700 cursor-pointer transition-colors ${
              selectedRestaurant?.id === restaurant.id
                ? 'bg-wfu-gray-700 border-l-2 border-l-wfu-gold'
                : 'hover:bg-wfu-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link href={`/restaurants/${restaurant.id}`} className="font-semibold text-white truncate hover:text-wfu-gold transition-colors block" onClick={(e) => e.stopPropagation()}>
                  {restaurant.name}
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  {restaurant.cuisine && (
                    <span className="text-xs px-2 py-0.5 bg-wfu-gray-600 rounded-full text-wfu-gray-300">
                      {restaurant.cuisine}
                    </span>
                  )}
                  {restaurant.priceRange && (
                    <span className="text-xs text-wfu-gray-400">
                      {'$'.repeat(restaurant.priceRange)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-1.5 text-xs text-wfu-gray-400">
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
              </div>

              {user && (
                <button
                  onClick={(e) => toggleFavorite(e, restaurant)}
                  className={`ml-2 p-1.5 rounded-full transition-colors ${
                    restaurant.isFavorite
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-wfu-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={18} className={restaurant.isFavorite ? 'fill-current' : ''} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-wfu-gray-400">
            No restaurants found
          </div>
        )}
      </div>
    </div>
  );
}
