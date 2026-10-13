'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import { posts as postsApi, restaurants as restaurantsApi } from '../lib/api';

export default function PostsPage() {
  const { user } = useAuth();
  const [postsData, setPostsData] = useState({ posts: [], total: 0, page: 1 });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (page = 1) => {
    try {
      const data = await postsApi.list({ page, limit: 20 });
      setPostsData(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await restaurantsApi.list();
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchRestaurants();
  }, [fetchPosts, fetchRestaurants]);

  const handleLike = async (postId) => {
    try {
      await postsApi.like(postId);
      fetchPosts(postsData.page);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsApi.delete(postId);
      fetchPosts(postsData.page);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handlePostCreated = () => {
    fetchPosts(1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-wfu-gold mb-6">Deacon Dining Feed</h1>

      {user && (
        <div className="mb-8">
          <PostComposer restaurants={restaurants} onPostCreated={handlePostCreated} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-wfu-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-wfu-gray-400">Loading posts...</p>
        </div>
      ) : postsData.posts.length === 0 ? (
        <div className="text-center py-12 text-wfu-gray-400">
          <p className="text-lg">No posts yet</p>
          <p className="mt-2">Be the first to share your dining experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {postsData.posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
