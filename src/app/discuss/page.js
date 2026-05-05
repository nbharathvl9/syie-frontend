"use client";
import { useState, useEffect } from 'react';
import { postApi } from '@/lib/api';
import PostCard from '@/components/PostCard';
import NotificationModal from '@/components/NotificationModal';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

export default function Discussion() {
    const [posts, setPosts] = useState([]);
    const [text, setText] = useState("");
    const [activeCommentId, setActiveCommentId] = useState(null);
    const { user } = useAuth();
    const { notification, showError, dismiss } = useNotification();

    async function fetchDiscussions() {
        try {
            const res = await postApi.getAll({ postType: 'Discussion' });
            setPosts(res.data);
        } catch (err) {
            console.error("Error loading discussions", err);
        }
    }

    useEffect(() => { fetchDiscussions(); }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        if (!user) { showError('Please login to post'); return; }
        try {
            await postApi.create({
                companyName: "General Discussion", experience: text,
                postType: "Discussion", authorRoll: user.rollNumber, authorName: user.fullName,
            });
            setText(""); fetchDiscussions();
        } catch (err) { showError('Error posting discussion'); }
    };

    const toggleComments = (postId) => setActiveCommentId(activeCommentId === postId ? null : postId);

    const handleCommentsUpdate = (postId, updatedComments) => {
        setPosts((prev) => prev.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
    };

    const handlePostReaction = async (postId, emoji) => {
        if (!user) { showError('Please login to react'); return; }
        try {
            const res = await postApi.togglePostReaction(postId, { emoji, authorName: user.fullName });
            setPosts((prev) => prev.map(p => p._id === postId ? { ...p, ...res.data } : p));
        } catch (err) { showError(err.response?.data?.msg || 'Failed to react'); }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black pb-20 pt-6">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tighter uppercase">Community Forum</h1>
                    <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Notices & General Queries</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handlePost}>
                        <textarea className="w-full resize-none outline-none text-sm p-2 placeholder-gray-400" rows="3"
                            placeholder="Ask a question or share news..." value={text} onChange={(e) => setText(e.target.value)} />
                        <div className="flex justify-end items-center mt-2 border-t border-gray-50 pt-3">
                            <button type="submit" className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest hover:opacity-80 transition-all">POST</button>
                        </div>
                    </form>
                </div>
                <div className="space-y-6">
                    {posts.length === 0 && <p className="text-center text-gray-400 py-10">No discussions yet. Start one!</p>}
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} currentUserRoll={user?.rollNumber}
                            onReaction={handlePostReaction} showComments={activeCommentId === post._id}
                            onToggleComments={toggleComments} onCommentsUpdate={handleCommentsUpdate} variant="discussion" />
                    ))}
                </div>
                <NotificationModal {...notification} onDismiss={dismiss} />
            </div>
        </div>
    );
}
