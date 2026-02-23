'use client';
import { useState, useEffect, useCallback } from 'react';
import { students as studentApi } from '../lib/api';
import { useAuth } from '../components/AuthContext';
import { Heart, MapPin, Star, Trash2, Utensils } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await studentApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleRemove = async (restaurantId) => {
    try {
      await studentApi.removeFavorite(restaurantId);
      setFavorites(prev => prev.filter(f => f.restaurant_id !== restaurantId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Heart className="w-12 h-12 text-wfu-gray-600 mx-auto mb-4" />
        <h1 className="text-xl font-display font-bold text-wfu-gold mb-2">Sign in to see your favorites</h1>
        <p className="text-wfu-gray-400">Track your favorite lunch and dinner spots near campus.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-wfu-gold/20 border border-wfu-gold/30 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-wfu-gold" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-wfu-gold">My Favorites</h1>
          <p className="text-sm text-wfu-gray-400">{favorites.length} saved restaurant{favorites.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-wfu-gray-500">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="card p-8 text-center">
          <Utensils className="w-10 h-10 text-wfu-gray-600 mx-auto mb-3" />
          <p className="text-wfu-gray-400 mb-2">No favorites yet</p>
          <p className="text-sm text-wfu-gray-500">Head to the map and heart the restaurants you love!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav, i) => (
            <div key={fav.id} className="card p-4 flex items-center gap-4 animate-fadeInUp"
                 style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 bg-wfu-gold/10 border border-wfu-gold/20 rounded-xl
                              flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5 text-wfu-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{fav.restaurant_name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-wfu-gray-400">
                  <span>{fav.cuisine_type}</span>
                  <span>·</span>
                  <span>{fav.price_range}</span>
                  <span>·</span>
                  <span className="capitalize">{fav.meal_type}</span>
                  {fav.address && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {fav.address.split(',')[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => handleRemove(fav.restaurant_id)}
                      className="text-wfu-gray-500 hover:text-red-400 transition-colors p-2"
                      title="Remove favorite">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
