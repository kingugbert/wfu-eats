'use client';
import { Star, Heart, HeartOff, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function RestaurantSidebar({
  restaurants = [], selectedId, onSelect, onToggleFavorite,
  cuisineFilter, setCuisineFilter, cuisines = []
}) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Header + Filter */}
      <div className="p-4 border-b border-wfu-gray-700">
        <h2 className="font-display text-lg font-bold text-wfu-gold mb-3">
          Nearby Restaurants
        </h2>
        <select
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
          className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-3 py-2 text-sm text-white
                     focus:outline-none focus:border-wfu-gold transition-colors"
        >
          <option value="">All Cuisines</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Restaurant list */}
      <div className="flex-1 overflow-y-auto">
        {restaurants.length === 0 && (
          <div className="p-6 text-center text-wfu-gray-500 text-sm">
            No restaurants found
          </div>
        )}
        {restaurants.map((r, i) => (
          <div
            key={r.id}
            onClick={() => onSelect(r)}
            className={`p-4 border-b border-wfu-gray-700/50 cursor-pointer transition-all
                        hover:bg-wfu-gray-700/30 animate-fadeInUp
                        ${r.id === selectedId ? 'bg-wfu-gold/10 border-l-2 border-l-wfu-gold' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm truncate ${r.id === selectedId ? 'text-wfu-gold' : 'text-white'}`}>
                  {r.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-wfu-gray-400">
                  <span>{r.cuisine_type}</span>
                  <span>·</span>
                  <span>{r.price_range}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {Number(r.distance_calc || 0).toFixed(1)} mi
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(r.avg_rating || 0) ? 'star-filled fill-wfu-gold' : 'star-empty'}`} />
                  ))}
                  <span className="text-xs text-wfu-gray-500 ml-1">
                    ({r.review_count || 0})
                  </span>
                </div>
              </div>

              {user && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(r); }}
                  className={`p-1.5 rounded-lg transition-all ${
                    r.is_favorite
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-wfu-gray-500 hover:text-wfu-gold hover:bg-wfu-gray-700'
                  }`}
                  title={r.is_favorite ? 'Remove favorite' : 'Add favorite'}
                >
                  <Heart className={`w-4 h-4 ${r.is_favorite ? 'fill-red-400' : ''}`} />
                </button>
              )}
            </div>

            {r.description && (
              <p className="text-xs text-wfu-gray-500 mt-2 line-clamp-2">{r.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-wfu-gray-700 text-center text-xs text-wfu-gray-500">
        {restaurants.length} restaurants within 5 miles of campus
      </div>
    </div>
  );
}
