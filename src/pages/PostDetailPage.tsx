import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { CommentComposer } from '../components/comments/CommentComposer';
import { CommentItem } from '../components/comments/CommentItem';
import { ArrowLeft, MessageSquare, ArrowUpDown, Sparkles } from 'lucide-react';
import { CommentSortOrder } from '../types';

export const PostDetailPage: React.FC = () => {
  const { posts, comments, selectedPostId, navigateTo } = useApp();
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>('most_liked');

  const post = posts.find((p) => p.id === selectedPostId) || posts[0];

  if (!post) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">Discussion not found.</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-3 px-4 py-2 bg-[#2F80ED] text-white rounded-xl text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Get all comments for this post
  const postComments = comments.filter((c) => c.postId === post.id);

  // Sort comments according to selected order
  const sortedComments = [...postComments].sort((a, b) => {
    // Keep author-pinned at the very top
    if (a.isPinnedByAuthor && !b.isPinnedByAuthor) return -1;
    if (!a.isPinnedByAuthor && b.isPinnedByAuthor) return 1;

    if (sortOrder === 'most_liked') {
      return b.likesCount - a.likesCount;
    }
    if (sortOrder === 'newest') {
      return parseInt(b.id.replace('cmt_', '')) - parseInt(a.id.replace('cmt_', ''));
    }
    if (sortOrder === 'most_replies') {
      return b.replies.length - a.replies.length;
    }
    return 0;
  });

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-5 pb-20">
      {/* Back button */}
      <div className="w-full flex items-center gap-3 px-4 sm:px-0 pt-2 sm:pt-0">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
        <div className="text-xs text-slate-400">
          <span>Discussion in</span>{' '}
          <span className="font-semibold text-slate-700">{post.topic}</span>
        </div>
      </div>

      {/* Main Post Card */}
      <PostCard post={post} isDetailedView={true} />

      {/* Discussion Composer */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between px-4 sm:px-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2F80ED]" />
            <h2 className="text-sm font-bold text-slate-900">
              Conversations ({postComments.length})
            </h2>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as CommentSortOrder)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#2F80ED]"
            >
              <option value="most_liked">Most Liked First</option>
              <option value="newest">Newest First</option>
              <option value="most_replies">Most Discussed (Replies)</option>
            </select>
          </div>
        </div>

        {/* Primary Comment Form */}
        <CommentComposer postId={post.id} autoFocus={false} />
      </div>

      {/* Comment Thread List */}
      <div className="w-full flex flex-col gap-3.5 mt-2">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">
              Be the first to share a perspective
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Comentosh thrives when readers contribute their real thoughts, questions, and counter-arguments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
