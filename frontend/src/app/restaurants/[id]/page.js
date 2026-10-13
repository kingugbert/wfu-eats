'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Star, MapPin, Phone, Globe, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { restaurants as restaurantsApi, students as studentsApi, posts as postsApi } from '../../lib/api';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [restaurantPosts, setRestaurantPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await restaurantsApi.get(id);
      setRestaurant(data);
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
      setError('Restaurant not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await postsApi.list({ restaurant_id: id });
      setRestaurantPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
    fetchPosts();
  }, [fetchRestaurant, fetchPosts]);

  const toggleFavorite = async () => {
    if (!user || !restaurant) return;
    try {
      if (restaurant.isFavorite) {
        await studentsApi.removeFavorite(restaurant.id);
      } else {
        await studentsApi.addFavorite(restaurant.id);
      }
      setRestaurant(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-wfu-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-wfu-gray-400">Loading restaurant...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Restaurant not found</h2>
        <Link href="/" className="text-wfu-gold hover:text-wfu-gold-light">
          Back to map
        </Link>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-wfu-gray-400 hover:text-wfu-gold mb-4 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>

      {/* Photo */}
      {restaurant.googlePhotoRef && (
        <div className="w-full h-56 rounded-xl overflow-hidden mb-6 bg-wfu-gray-800">
          <img
            src={`${apiUrl}/api/google/photo/${restaurant.googlePhotoRef}?maxWidth=800`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
          <div className="flex items-center flex-wrap gap-3 mt-2">
            {restaurant.cuisine && (
              <span className="px-3 py-1 bg-wfu-gray-700 rounded-full text-sm text-wfu-gray-300">
                {restaurant.cuisine}
              </span>
            )}
            {restaurant.priceRange && (
              <span className="text-wfu-gray-400 text-sm">
                {'$'.repeat(restaurant.priceRange)}
              </span>
            )}
            {restaurant.googleRating && (
              <span className="flex items-center text-wfu-gold text-sm">
                <Star size={14} className="mr-1 fill-current" />
                {restaurant.googleRating}
              </span>
            )}
            <span className="flex items-center text-wfu-gray-400 text-sm">
              <MapPin size={14} className="mr-1" />
              {restaurant.distanceMiles} mi from campus
            </span>
          </div>
        </div>

        {user && (
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-full transition-colors ${
              restaurant.isFavorite
                ? 'text-red-400 hover:text-red-300 bg-wfu-gray-800'
                : 'text-wfu-gray-400 hover:text-red-400 bg-wfu-gray-800'
            }`}
          >
            <Heart size={22} className={restaurant.isFavorite ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      {/* Info cards */}
      <div className="grid gap-3 mb-8">
        {restaurant.address && (
          <div className="flex items-start bg-wfu-gray-800 rounded-lg p-4 border border-wfu-gray-700">
            <MapPin size={18} className="text-wfu-gold mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-wfu-gray-400">Address</div>
              <div className="text-white">{restaurant.address}</div>
            </div>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-start bg-wfu-gray-800 rounded-lg p-4 border border-wfu-gray-700">
            <Phone size={18} className="text-wfu-gold mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-wfu-gray-400">Phone</div>
              <a href={`tel:${restaurant.phone}`} className="text-white hover:text-wfu-gold transition-colors">
                {restaurant.phone}
              </a>
            </div>
          </div>
        )}

        {restaurant.website && (
          <div className="flex items-start bg-wfu-gray-800 rounded-lg p-4 border border-wfu-gray-700">
            <Globe size={18} className="text-wfu-gold mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-wfu-gray-400">Website</div>
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-wfu-gold transition-colors break-all"
              >
                {restaurant.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          </div>
        )}

        {restaurant.description && (
          <div className="bg-wfu-gray-800 rounded-lg p-4 border border-wfu-gray-700">
            <div className="text-sm text-wfu-gray-400 mb-1">About</div>
            <p className="text-white">{restaurant.description}</p>
          </div>
        )}
      </div>

      {/* Posts / Reviews */}
      <div>
        <h2 className="text-xl font-bold text-wfu-gold mb-4">
          Reviews {restaurantPosts.length > 0 && `(${restaurantPosts.length})`}
        </h2>

        {restaurantPosts.length === 0 ? (
          <div className="text-center py-8 text-wfu-gray-400 bg-wfu-gray-800 rounded-xl border border-wfu-gray-700">
            <p>No reviews yet for this restaurant.</p>
            {user && (
              <Link
                href="/posts"
                className="inline-block mt-2 text-wfu-gold hover:text-wfu-gold-light transition-colors"
              >
                Write the first review
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {restaurantPosts.map(post => (
              <div key={post.id} className="bg-wfu-gray-800 rounded-xl p-5 border border-wfu-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{post.title}</h3>
                  {post.rating && (
                    <span className="flex items-center text-wfu-gold text-sm">
                      <Star size={14} className="mr-1 fill-current" />
                      {post.rating}/5
                    </span>
                  )}
                </div>
                <p className="text-wfu-gray-300 text-sm mb-3">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-wfu-gray-400">
                  <span>{post.author?.firstName} {post.author?.lastName}</span>
                  <div className="flex items-center gap-3">
                    {post.mealType && <span className="px-2 py-0.5 bg-wfu-gray-700 rounded-full">{post.mealType}</span>}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
