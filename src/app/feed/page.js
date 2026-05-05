"use client";
import { useState, useEffect } from 'react';
import { postApi } from '@/lib/api';
import PostCard from '@/components/PostCard';
import NotificationModal from '@/components/NotificationModal';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const { user } = useAuth();
  const { notification, showError, dismiss } = useNotification();

  async function fetchPosts(pageNum, searchTerm, reset = false) {
    try {
      const res = await postApi.getAll({
        page: pageNum,
        company: searchTerm || undefined,
        postType: 'Interview',
      });

      if (res.data.length < 10) setHasMore(false);
      else setHasMore(true);

      if (reset) setPosts(res.data);
      else setPosts(prev => [...prev, ...res.data]);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPosts([]);
      setPage(1);
      fetchPosts(1, search, true);
    }, search ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const toggleComments = (postId) => {
    setActiveCommentId(activeCommentId === postId ? null : postId);
  };

  const handleCommentsUpdate = (postId, updatedComments) => {
    setPosts((prevPosts) => prevPosts.map(post =>
      post._id === postId ? { ...post, comments: updatedComments } : post
    ));
  };

  const handlePostReaction = async (postId, emoji) => {
    if (!user) {
      showError('Please login to react');
      return;
    }

    try {
      const res = await postApi.togglePostReaction(postId, {
        emoji,
        authorName: user.fullName,
      });

      setPosts((prevPosts) => prevPosts.map((post) =>
        post._id === postId ? { ...post, ...res.data } : post
      ));
    } catch (err) {
      showError(err.response?.data?.msg || 'Failed to react to post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Interview Archive</h1>
          <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">
            Real experiences from real students
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by company (e.g. Google)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 outline-none text-sm font-medium placeholder-gray-400 bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 && (
            <p className="text-center text-gray-400 py-10">No interview stories found.</p>
          )}

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserRoll={user?.rollNumber}
              onReaction={handlePostReaction}
              showComments={activeCommentId === post._id}
              onToggleComments={toggleComments}
              onCommentsUpdate={handleCommentsUpdate}
              variant="interview"
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && posts.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchPosts(nextPage, search, false);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black border-b border-transparent hover:border-black pb-0.5 transition-all"
            >
              LOAD MORE STORIES
            </button>
          </div>
        )}

        <NotificationModal {...notification} onDismiss={dismiss} />
      </div>
    </div>
  );
}
