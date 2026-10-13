'use client';

import { Heart, Trash2, Star, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './AuthContext';

export default function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="bg-wfu-gray-800 rounded-xl p-6 border border-wfu-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{post.title}</h3>
          <div className="flex items-center space-x-3 mt-1 text-sm text-wfu-gray-400">
            <span>{post.author.firstName} {post.author.lastName}</span>
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {post.rating && (
          <div className="flex items-center space-x-1 text-wfu-gold">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < post.rating ? 'fill-current' : 'text-wfu-gray-600'}
              />
            ))}
          </div>
        )}
      </div>

      {post.restaurantName && (
        <div className="flex items-center space-x-1 mb-3 text-sm text-wfu-gold">
          <MapPin size={14} />
          <span>{post.restaurantName}</span>
          {post.mealType && (
            <span className="ml-2 px-2 py-0.5 bg-wfu-gray-700 rounded-full text-xs text-wfu-gray-300">
              {post.mealType}
            </span>
          )}
        </div>
      )}

      <p className="text-wfu-gray-300 leading-relaxed mb-4">{post.content}</p>

      <div className="flex items-center justify-between pt-3 border-t border-wfu-gray-700">
        <button
          onClick={() => onLike && onLike(post.id)}
          disabled={!user}
          className={`flex items-center space-x-1.5 text-sm transition-colors ${
            post.isLiked
              ? 'text-red-400'
              : user
                ? 'text-wfu-gray-400 hover:text-red-400'
                : 'text-wfu-gray-600 cursor-not-allowed'
          }`}
        >
          <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
          <span>{post.likeCount}</span>
        </button>

        {user && user.id === post.author.id && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-wfu-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
