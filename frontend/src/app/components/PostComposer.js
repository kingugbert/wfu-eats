'use client';
import { useState } from 'react';
import { Send, Star, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function PostComposer({ restaurants = [], onSubmit }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', restaurantId: '', mealType: '', rating: 0
  });

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: form.title,
        body: form.body,
        restaurantId: form.restaurantId || undefined,
        mealType: form.mealType || undefined,
        rating: form.rating || undefined,
      });
      setForm({ title: '', body: '', restaurantId: '', mealType: '', rating: 0 });
      setExpanded(false);
    } catch (err) {
      console.error('Post failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="card overflow-hidden">
      {/* Collapsed state */}
      {!expanded ? (
        <button onClick={() => setExpanded(true)}
                className="w-full p-4 flex items-center gap-3 hover:bg-wfu-gray-700/30 transition-colors text-left">
          <div className="w-10 h-10 bg-wfu-gold/20 border border-wfu-gold/30 rounded-full
                          flex items-center justify-center text-wfu-gold font-semibold text-sm shrink-0">
            {user.display_name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-wfu-gray-400 text-sm">What are you eating today, {user.display_name?.split(' ')[0]}?</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-wfu-gold/20 border border-wfu-gold/30 rounded-full
                            flex items-center justify-center text-wfu-gold font-semibold text-sm shrink-0">
              {user.display_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white">{user.display_name}</span>
          </div>

          <input
            type="text" placeholder="Give your post a title..." required
            value={form.title} onChange={update('title')}
            className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white text-sm
                       placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold transition-colors"
          />

          <textarea
            placeholder="Where are you eating? What's good? Share your experience..."
            required rows={3} value={form.body} onChange={update('body')}
            className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white text-sm
                       placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold transition-colors resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.restaurantId} onChange={update('restaurantId')}
                    className="bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-3 py-2 text-sm text-white
                               focus:outline-none focus:border-wfu-gold transition-colors">
              <option value="">Tag a restaurant</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <select value={form.mealType} onChange={update('mealType')}
                    className="bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-3 py-2 text-sm text-white
                               focus:outline-none focus:border-wfu-gold transition-colors">
              <option value="">Meal type</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-wfu-gray-400">Rating:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: f.rating === s ? 0 : s }))}
                        className="p-0.5">
                  <Star className={`w-5 h-5 transition-colors ${s <= form.rating ? 'star-filled fill-wfu-gold' : 'star-empty text-wfu-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setExpanded(false)}
                    className="text-sm text-wfu-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !form.title.trim() || !form.body.trim()}
                    className="btn-gold text-sm flex items-center gap-2 disabled:opacity-50">
              <Send className="w-4 h-4" />
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
