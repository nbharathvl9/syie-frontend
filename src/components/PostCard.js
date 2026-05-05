"use client";
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import Avatar from '@/components/Avatar';
import ReactionBar from '@/components/ReactionBar';
import Comments from '@/components/Comments';
import { formatPostTime } from '@/lib/timeUtils';

/**
 * Reusable post card component.
 * Deduplicates the ~70-line card JSX shared between feed and discuss pages.
 *
 * Props:
 *   post             - the post object
 *   currentUserRoll  - current user's roll number (for reaction state)
 *   onReaction       - (postId, emoji) => void
 *   showComments     - boolean indicating if comments are expanded
 *   onToggleComments - (postId) => void
 *   onCommentsUpdate - (postId, updatedComments) => void
 *   variant          - 'interview' | 'discussion' (controls layout details)
 */
export default function PostCard({
  post,
  currentUserRoll,
  onReaction,
  showComments,
  onToggleComments,
  onCommentsUpdate,
  variant = 'interview',
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Card Header: Author & Metadata */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} />
          <div>
            <Link
              href={`/student/${post.authorRoll}`}
              className="block text-sm font-bold hover:underline decoration-1 underline-offset-2"
            >
              {post.authorName}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>{formatPostTime(post.createdAt)}</span>
              {variant === 'interview' && post.authorPlacement?.isPlaced && (
                <>
                  <span>•</span>
                  <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                    Placed @ {post.authorPlacement.placedCompany}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-4">
        {variant === 'interview' && (
          <h3 className="text-lg font-black tracking-tight uppercase mb-2 text-gray-900">
            {post.companyName}
          </h3>
        )}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.experience}
        </p>
      </div>

      {/* Card Footer: Reactions & Comment Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ReactionBar
          reactions={post.reactions}
          currentUserRoll={currentUserRoll}
          onToggle={(emoji) => onReaction(post._id, emoji)}
        />

        <button
          onClick={() => onToggleComments(post._id)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          <MessageCircle
            size={14}
            className={showComments ? 'text-black' : 'text-gray-400'}
          />
          {showComments
            ? 'Hide Comments'
            : `Comments (${post.comments?.length || 0})`}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <Comments
            postId={post._id}
            comments={post.comments}
            onCommentsUpdate={(updatedComments) =>
              onCommentsUpdate(post._id, updatedComments)
            }
          />
        </div>
      )}
    </div>
  );
}
