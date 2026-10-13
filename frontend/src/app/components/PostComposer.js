'use client';

import { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { posts as postsApi } from '../lib/api';

export default function PostComposer({ restaurants, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [mealType, setMealType] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mealTypes = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late Night', 'Snack'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const post = await postsApi.create({
        title: title.trim(),
        content: content.trim(),
        restaurantId: restaurantId || undefined,
        mealType: mealType || undefined,
        rating: rating || undefined
      });

      setTitle('');
      setContent('');
      setRestaurantId('');
      setMealType('');
      setRating(0);

      if (onPostCreated) onPostCreated(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wfu-gray-800 rounded-xl p-6 border border-wfu-gray-700">
      <h3 className="text-lg font-bold text-wfu-gold mb-4">Share Your Experience</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title..."
          required
          className="w-full px-4 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell us about your dining experience..."
          required
          rows={4}
          className="w-full px-4 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold resize-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-wfu-gold"
          >
            <option value="">Tag a restaurant</option>
            {restaurants?.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-wfu-gold"
          >
            <option value="">Meal type</option>
            {mealTypes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="flex items-center space-x-1">
            <span className="text-sm text-wfu-gray-400 mr-2">Rating:</span>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star === rating ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-colors"
              >
                <Star
                  size={20}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-wfu-gold fill-current'
                      : 'text-wfu-gray-600'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="flex items-center space-x-2 px-6 py-2 bg-wfu-gold text-black font-semibold rounded-lg hover:bg-wfu-gold-light transition-colors disabled:opacity-50"
        >
          <Send size={16} />
          <span>{loading ? 'Posting...' : 'Post'}</span>
        </button>
      </form>
    </div>
  );
}
