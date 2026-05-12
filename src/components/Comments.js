"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { postApi } from '@/lib/api';
import ReactionBar from '@/components/ReactionBar';
import NotificationModal from '@/components/NotificationModal';
import ConfirmModal from '@/components/ConfirmModal';
import { formatPostTime } from '@/lib/timeUtils';

export default function Comments({ postId, comments: initialComments, onCommentsUpdate }) {
    const [newComment, setNewComment] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyDrafts, setReplyDrafts] = useState({});
    const [deleteModalState, setDeleteModalState] = useState({ show: false, commentId: null, replyId: null });
    const { user, isLoggedIn } = useAuth();
    const { notification, showError, dismiss } = useNotification();

    const comments = initialComments || [];

    const updateComments = (updatedComments) => {
        if (onCommentsUpdate) onCommentsUpdate(updatedComments);
    };

    const requireUser = (message = 'Please login to continue') => {
        if (!user) { showError(message); return null; }
        return user;
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const u = requireUser('Please login to comment');
        if (!u) return;
        try {
            const res = await postApi.addComment(postId, { text: newComment.trim(), authorName: u.fullName });
            updateComments(res.data); setNewComment("");
        } catch (err) { showError(err.response?.data?.msg || 'Error posting comment'); }
    };

    const handleDeleteComment = async (commentId) => {
        setDeleteModalState({ show: true, commentId, replyId: null });
    };

    const toggleReplyEditor = (commentId) => {
        if (!isLoggedIn) { showError('Please login to reply'); return; }
        setActiveReplyId((id) => id === commentId ? null : commentId);
    };

    const handleReply = async (commentId) => {
        const replyText = replyDrafts[commentId]?.trim();
        if (!replyText) return;
        const u = requireUser('Please login to reply');
        if (!u) return;
        try {
            const res = await postApi.addReply(postId, commentId, { text: replyText, authorName: u.fullName });
            updateComments(res.data);
            setReplyDrafts((d) => ({ ...d, [commentId]: "" })); setActiveReplyId(null);
        } catch (err) { showError(err.response?.data?.msg || 'Failed to post reply'); }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        setDeleteModalState({ show: true, commentId, replyId });
    };

    const confirmDelete = async () => {
        const { commentId, replyId } = deleteModalState;
        setDeleteModalState({ show: false, commentId: null, replyId: null });
        if (replyId) {
            try {
                const res = await postApi.deleteReply(postId, commentId, replyId);
                updateComments(res.data);
            } catch (err) { showError(err.response?.data?.msg || 'Failed to delete reply'); }
        } else {
            try {
                const res = await postApi.deleteComment(postId, commentId);
                updateComments(res.data);
            } catch (err) { showError(err.response?.data?.msg || 'Failed to delete comment'); }
        }
    };

    const handleCommentReaction = async (commentId, emoji) => {
        const u = requireUser('Please login to react');
        if (!u) return;
        try {
            const res = await postApi.toggleCommentReaction(postId, commentId, { emoji, authorName: u.fullName });
            updateComments(res.data);
        } catch (err) { showError(err.response?.data?.msg || 'Failed to react to comment'); }
    };

    const handleReplyReaction = async (commentId, replyId, emoji) => {
        const u = requireUser('Please login to react');
        if (!u) return;
        try {
            const res = await postApi.toggleReplyReaction(postId, commentId, replyId, { emoji, authorName: u.fullName });
            updateComments(res.data);
        } catch (err) { showError(err.response?.data?.msg || 'Failed to react to reply'); }
    };

    return (
        <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 text-gray-400">Discussion</h3>

            {isLoggedIn ? (
                <form onSubmit={handleComment} className="mb-8 flex gap-2">
                    <input type="text" value={newComment} placeholder="Ask a question or say congrats..."
                        className="flex-1 border-b border-gray-200 focus:border-black outline-none py-2 text-sm font-medium bg-transparent"
                        onChange={(e) => setNewComment(e.target.value)} />
                    <button className="text-[10px] font-black uppercase tracking-widest text-black hover:opacity-70 transition-opacity">POST</button>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <p className="text-sm text-gray-600 mb-3">Want to join the discussion?</p>
                    <a href="/login" className="inline-block bg-black text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-gray-800 transition-all">LOGIN TO COMMENT</a>
                </div>
            )}

            <div className="space-y-6">
                {comments.length === 0 && <p className="text-xs font-medium text-gray-400">No comments yet. Start the conversation.</p>}
                {comments.map((comment, index) => (
                    <div key={comment._id || index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-baseline gap-4 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-tight">{comment.authorName}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatPostTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <ReactionBar reactions={comment.reactions} currentUserRoll={user?.rollNumber} onToggle={(emoji) => handleCommentReaction(comment._id, emoji)} compact />
                            <button type="button" onClick={() => toggleReplyEditor(comment._id)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                                {activeReplyId === comment._id ? 'Cancel Reply' : `Reply${comment.replies?.length ? ` (${comment.replies.length})` : ''}`}
                            </button>
                            {user?.rollNumber === comment.authorRoll && (
                                <button type="button" onClick={() => handleDeleteComment(comment._id)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                            )}
                        </div>

                        {activeReplyId === comment._id && isLoggedIn && (
                            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                                <textarea rows="2" value={replyDrafts[comment._id] || ""} placeholder={`Reply to ${comment.authorName}...`}
                                    className="w-full resize-none outline-none text-sm text-gray-700 placeholder-gray-400"
                                    onChange={(e) => setReplyDrafts((d) => ({ ...d, [comment._id]: e.target.value }))} />
                                <div className="mt-3 flex justify-end gap-2">
                                    <button type="button" onClick={() => setActiveReplyId(null)} className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Cancel</button>
                                    <button type="button" onClick={() => handleReply(comment._id)} className="px-4 py-2 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Reply</button>
                                </div>
                            </div>
                        )}

                        {comment.replies?.length > 0 && (
                            <div className="mt-4 space-y-3 border-l border-gray-200 pl-4">
                                {comment.replies.map((reply, ri) => (
                                    <div key={reply._id || ri} className="rounded-xl bg-white p-3 border border-gray-100">
                                        <div className="flex justify-between items-baseline gap-4 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-tight">{reply.authorName}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatPostTime(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                            <ReactionBar reactions={reply.reactions} currentUserRoll={user?.rollNumber} onToggle={(emoji) => handleReplyReaction(comment._id, reply._id, emoji)} compact />
                                            {user?.rollNumber === reply.authorRoll && (
                                                <button type="button" onClick={() => handleDeleteReply(comment._id, reply._id)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmModal
                show={deleteModalState.show}
                title={deleteModalState.replyId ? "Delete Reply?" : "Delete Comment?"}
                message="This action cannot be undone. Are you sure you want to delete this?"
                confirmLabel="Delete"
                danger={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalState({ show: false, commentId: null, replyId: null })}
            />

            <NotificationModal {...notification} onDismiss={dismiss} />
        </div>
    );
}
