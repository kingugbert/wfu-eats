'use client';
import { Heart, Trash2, Clock, Star, Utensils } from 'lucide-react';
import { useAuth } from './AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuth();
  const isOwner = user?.id === post.student_id;

  return (
    <article className="card p-5 animate-fadeInUp">
      {/* Author header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-wfu-gold/20 border border-wfu-gold/30 rounded-full
                          flex items-center justify-center text-wfu-gold font-semibold text-sm">
            {post.author_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{post.author_name}</p>
            <div className="flex items-center gap-2 text-xs text-wfu-gray-400">
              <Clock className="w-3 h-3" />
              <span>{timeAgo(post.created_at)}</span>
              {post.meal_type && (
                <>
                  <span>·</span>
                  <span className="capitalize">{post.meal_type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <button onClick={() => onDelete(post.id)}
                  className="text-wfu-gray-500 hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Restaurant tag */}
      {post.restaurant_name && (
        <div className="inline-flex items-center gap-1.5 bg-wfu-gold/10 text-wfu-gold text-xs
                        px-3 py-1.5 rounded-full mb-3 border border-wfu-gold/20">
          <Utensils className="w-3 h-3" />
          {post.restaurant_name}
          {post.cuisine_type && <span className="text-wfu-gray-400">· {post.cuisine_type}</span>}
        </div>
      )}

      {/* Title + Body */}
      <h3 className="text-base font-semibold text-white mb-2">{post.title}</h3>
      <p className="text-sm text-wfu-gray-300 leading-relaxed whitespace-pre-line">{post.body}</p>

      {/* Rating */}
      {post.rating && (
        <div className="flex items-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-4 h-4 ${s <= post.rating ? 'star-filled fill-wfu-gold' : 'star-empty'}`} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-wfu-gray-700/50">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors
                      ${post.has_liked ? 'text-red-400' : 'text-wfu-gray-400 hover:text-red-400'}`}
        >
          <Heart className={`w-4 h-4 ${post.has_liked ? 'fill-red-400' : ''}`} />
          <span>{post.likes || 0}</span>
        </button>
      </div>
    </article>
  );
}
