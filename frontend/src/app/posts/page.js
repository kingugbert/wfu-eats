'use client';
import { useState, useEffect, useCallback } from 'react';
import { posts as postsApi, restaurants as restaurantApi } from '../lib/api';
import { useAuth } from '../components/AuthContext';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function PostsPage() {
  const { user } = useAuth();
  const [postList, setPostList] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postsApi.list({ page: String(page), limit: '20' });
      setPostList(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
    restaurantApi.list({ radius: '5' }).then(setRestaurantList).catch(() => {});
  }, [fetchPosts]);

  const handleCreatePost = async (postData) => {
    await postsApi.create(postData);
    setPage(1);
    fetchPosts();
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const result = await postsApi.like(postId);
      setPostList(prev => prev.map(p =>
        p.id === postId
          ? { ...p, has_liked: result.liked, likes: result.liked ? (p.likes || 0) + 1 : Math.max((p.likes || 0) - 1, 0) }
          : p
      ));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsApi.delete(postId);
      setPostList(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-wfu-gold/20 border border-wfu-gold/30 rounded-xl
                        flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-wfu-gold" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-wfu-gold">Deacon Eats Feed</h1>
          <p className="text-sm text-wfu-gray-400">See what fellow Deacs are eating</p>
        </div>
      </div>

      {/* Composer */}
      <div className="mb-6">
        <PostComposer restaurants={restaurantList} onSubmit={handleCreatePost} />
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading && postList.length === 0 ? (
          <div className="text-center py-12 text-wfu-gray-500">Loading posts...</div>
        ) : postList.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-wfu-gray-400 mb-2">No posts yet</p>
            <p className="text-sm text-wfu-gray-500">Be the first to share what you are eating!</p>
          </div>
        ) : (
          postList.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
              <PostCard post={post} onLike={handleLike} onDelete={handleDelete} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="btn-outline-gold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-wfu-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="btn-outline-gold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
