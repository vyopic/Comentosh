import React from 'react';
import { Reply } from '../../types';
import { useApp } from '../../context/AppContext';
import { ThumbsUp, Trash2, CornerDownRight } from 'lucide-react';

interface ReplyItemProps {
  reply: Reply;
  onReplyClick?: (authorUsername: string) => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onReplyClick }) => {
  const { currentUser, toggleReplyLike, deleteReply, openUserProfile } = useApp();

  const isAuthor = currentUser.id === reply.author.id;

  return (
    <div className="w-full flex items-start gap-3 pl-3 py-2 border-l-2 border-slate-200/80 group">
      <img
        src={reply.author.avatar}
        alt={reply.author.name}
        onClick={() => openUserProfile(reply.author.id)}
        className="w-7 h-7 rounded-full bg-slate-100 object-cover cursor-pointer shrink-0 border border-slate-200"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              onClick={() => openUserProfile(reply.author.id)}
              className="text-xs font-semibold text-slate-900 cursor-pointer hover:text-[#2F80ED] transition-colors"
            >
              {reply.author.name}
            </span>
            <span className="text-[11px] text-slate-400">@{reply.author.username}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400">{reply.createdAt}</span>

            {reply.replyToUsername && (
              <span className="text-[11px] text-slate-500 font-medium">
                replying to <span className="text-[#2F80ED]">@{reply.replyToUsername}</span>
              </span>
            )}
          </div>

          {isAuthor && (
            <button
              onClick={() => deleteReply(reply.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
              title="Delete reply"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-800 leading-relaxed mt-1 whitespace-pre-line break-words [overflow-wrap:anywhere]">
          {reply.content}
        </p>

        {/* Reply Actions: Like & Reply */}
        <div className="flex items-center gap-3 mt-1.5 text-[11px]">
          <button
            onClick={() => toggleReplyLike(reply.id)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
              reply.isLikedByMe
                ? 'bg-blue-50 text-[#2F80ED] font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{reply.likesCount}</span>
          </button>

          {onReplyClick && (
            <button
              onClick={() => onReplyClick(reply.author.username)}
              className="flex items-center gap-1 text-slate-500 hover:text-[#2F80ED] transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
