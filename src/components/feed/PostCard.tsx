import React, { useState } from 'react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { ImageGallery } from './ImageGallery';
import {
  MessageSquare,
  Users,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  ArrowRight,
  Send,
  Trash2,
  Edit3,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  isDetailedView?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isDetailedView = false }) => {
  const {
    currentUser,
    openPostDetails,
    openUserProfile,
    toggleSavePost,
    sharePost,
    deletePost,
    editPost,
    addComment,
    toggleCommentLike,
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [quickComment, setQuickComment] = useState('');
  const [isReplyingQuick, setIsReplyingQuick] = useState(false);

  const isAuthor = currentUser.id === post.author.id;

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickComment.trim()) {
      addComment(post.id, quickComment.trim());
      setQuickComment('');
      setIsReplyingQuick(false);
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      editPost(post.id, { content: editedContent.trim(), topic: post.topic, images: post.images });
      setIsEditing(false);
    }
  };

  return (
    <article className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Post Header */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-3">
        <div
          onClick={() => openUserProfile(post.author.id)}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-1 min-w-0"
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-slate-900 text-sm group-hover:text-[#2F80ED] transition-colors truncate">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <span className="text-[#2F80ED] text-[10px] shrink-0" title="Verified Thinker">
                  ●
                </span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-slate-500 leading-normal mt-0.5">
              <span className="truncate max-w-[100px] sm:max-w-none">@{post.author.username}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="shrink-0">{post.createdAt}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 truncate max-w-[130px] sm:max-w-none">
                {post.topic}
              </span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-20 text-xs">
              <button
                onClick={() => {
                  sharePost(post.id);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy discussion link</span>
              </button>

              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{post.isSaved ? 'Remove from saved' : 'Save discussion'}</span>
              </button>

              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit discussion</span>
                  </button>

                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete discussion</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={4}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2F80ED]"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2F80ED] text-white hover:bg-[#256fd1]"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isDetailedView && openPostDetails(post.id)}
          className={`${!isDetailedView ? 'cursor-pointer' : ''}`}
        >
          <p className="text-slate-900 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal break-words [overflow-wrap:anywhere]">
            {post.content}
          </p>

          {/* Optional Attached Images */}
          {post.images && <ImageGallery images={post.images} />}
        </div>
      )}

      {/* Post Action Metrics (NOTE: NO POST LIKE BUTTON) */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (!isDetailedView ? openPostDetails(post.id) : setIsReplyingQuick(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-[#2F80ED] hover:bg-blue-50 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4 text-[#2F80ED]" />
            <span>{post.commentsCount} Comments</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.participantsCount} Thinkers engaged</span>
          </div>
        </div>

        {/* Share Button on Right Side (Save is available via 3-dots menu) */}
        <button
          onClick={() => sharePost(post.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-[#2F80ED] hover:bg-blue-50 transition-colors font-medium text-xs"
          title="Share discussion"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* SPOTLIGHT TOP COMMENT (Comment-First Signature Feature) */}
      {!isDetailedView && post.topComment && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 w-full">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 w-full">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <span>Top Community Perspective</span>
            </span>
            <button
              onClick={() => openPostDetails(post.id)}
              className="hover:text-[#2F80ED] flex items-center gap-1 text-[#2F80ED] font-medium"
            >
              <span>View all {post.commentsCount} comments</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 w-full">
              <div
                onClick={() => openUserProfile(post.topComment!.author.id)}
                className="flex items-center gap-2 cursor-pointer group min-w-0 flex-1"
              >
                <img
                  src={post.topComment.author.avatar}
                  alt={post.topComment.author.name}
                  className="w-6 h-6 rounded-full bg-slate-200 object-cover shrink-0"
                />
                <span className="text-xs font-semibold text-slate-900 group-hover:text-[#2F80ED] transition-colors truncate">
                  {post.topComment.author.name}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {post.topComment.createdAt}
                </span>
              </div>

              {/* Comment Reaction (Comment Like) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCommentLike(post.topComment!.id);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  post.topComment.isLikedByMe
                    ? 'bg-blue-100 text-[#2F80ED]'
                    : 'text-slate-500 hover:bg-slate-200/60'
                }`}
                title="Agree with this comment"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{post.topComment.likesCount}</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere]">
              {post.topComment.content}
            </p>

            {post.topComment.replies.length > 0 && (
              <div
                onClick={() => openPostDetails(post.id)}
                className="text-[11px] text-[#2F80ED] hover:underline cursor-pointer font-medium pt-1"
              >
                ↳ {post.topComment.replies.length} replies in this thread
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Comment Input Bar */}
      {!isDetailedView && (
        <form onSubmit={handleQuickCommentSubmit} className="mt-3 flex items-center gap-2 w-full min-w-0">
          <input
            type="text"
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            placeholder="Add your perspective to this discussion..."
            className="flex-1 min-w-0 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!quickComment.trim()}
            className="px-3.5 py-2 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] disabled:opacity-40 disabled:hover:bg-[#2F80ED] transition-all shrink-0"
            title="Publish comment"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </article>
  );
};
