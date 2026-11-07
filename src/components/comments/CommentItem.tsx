import React, { useState } from 'react';
import { Comment } from '../../types';
import { useApp } from '../../context/AppContext';
import { ReplyItem } from './ReplyItem';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Edit2,
  Trash2,
  CornerDownRight,
  Send,
  Pin,
} from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const {
    currentUser,
    toggleCommentLike,
    editComment,
    deleteComment,
    addReply,
    openUserProfile,
    showToast,
  } = useApp();

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyToUser, setReplyToUser] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(true);

  const isAuthor = currentUser.id === comment.author.id;

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addReply(comment.id, replyContent.trim(), replyToUser);
    setReplyContent('');
    setIsReplying(false);
    setIsRepliesExpanded(true);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      editComment(comment.id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleShareComment = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#comment-${comment.id}`);
    }
    showToast('Comment link copied', 'info');
  };

  const handleStartReply = (targetUsername?: string) => {
    setReplyToUser(targetUsername || comment.author.username);
    setIsReplying(true);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 transition-all hover:border-slate-300/80"
    >
      {/* Top Comment / Pinned indicator */}
      {comment.isPinnedByAuthor && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2F80ED] mb-2 bg-blue-50/60 px-2.5 py-1 rounded-md w-fit">
          <Pin className="w-3 h-3 rotate-45" />
          <span>Pinned by author · Top Community Perspective</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => openUserProfile(comment.author.id)}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
        >
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-[#2F80ED] transition-colors">
                {comment.author.name}
              </span>
              {comment.author.isVerified && (
                <span className="text-[#2F80ED] text-[10px]">●</span>
              )}
              <span className="text-[11px] text-slate-400">@{comment.author.username}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-400">{comment.createdAt}</span>
            </div>
            {comment.author.headline && (
              <p className="text-[10px] text-slate-500 truncate">{comment.author.headline}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-20 text-xs">
              <button
                onClick={() => {
                  handleShareComment();
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share link</span>
              </button>

              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      deleteComment(comment.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      {isEditing ? (
        <div className="mt-2.5">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs font-semibold bg-[#2F80ED] text-white hover:bg-[#256fd1] rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2.5 text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal break-words [overflow-wrap:anywhere]">
          {comment.content}
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Comment Like Button (Main reaction) */}
          <button
            onClick={() => toggleCommentLike(comment.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
              comment.isLikedByMe
                ? 'bg-blue-50 text-[#2F80ED]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Agree with perspective"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{comment.likesCount} Agree</span>
          </button>

          {/* Reply trigger */}
          <button
            onClick={() => handleStartReply()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#2F80ED] hover:bg-slate-100 transition-colors font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {/* Share Comment */}
          <button
            onClick={handleShareComment}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Share Comment"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Replies toggle if replies exist */}
        {comment.replies.length > 0 && (
          <button
            onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
            className="text-[11px] text-slate-500 hover:text-[#2F80ED] transition-colors font-medium ml-auto"
          >
            {isRepliesExpanded
              ? `Hide replies (${comment.replies.length})`
              : `Show ${comment.replies.length} replies`}
          </button>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-3 pl-3 pt-2 border-l-2 border-[#2F80ED]">
          <div className="text-[11px] text-slate-500 mb-1 font-medium">
            Replying to <span className="text-[#2F80ED]">@{replyToUser || comment.author.username}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              autoFocus
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a constructive reply..."
              className="flex-1 min-w-0 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="p-2 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] disabled:opacity-40 transition-colors shrink-0"
              title="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyContent('');
              }}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 shrink-0"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {isRepliesExpanded && comment.replies.length > 0 && (
        <div className="mt-3 pt-2 space-y-2.5 pl-2">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onReplyClick={(username) => handleStartReply(username)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
