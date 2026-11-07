import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, CornerDownRight, Bold, Quote, Code } from 'lucide-react';

interface CommentComposerProps {
  postId: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  postId,
  placeholder = 'Add a thoughtful perspective to this discussion...',
  autoFocus = false,
}) => {
  const { addComment, currentUser } = useApp();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment(postId, content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}${prefix}${suffix}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/90 p-4 shadow-xs"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200"
        />
        <span className="text-xs font-semibold text-slate-800">
          Commenting as <span className="text-[#2F80ED]">{currentUser.name}</span>
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all resize-none leading-relaxed"
      />

      {/* Formatting & Submit row */}
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ')}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('`', '`')}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
            title="Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">
            Tip: Press Ctrl+Enter to submit
          </span>
        </div>

        <button
          type="submit"
          disabled={!content.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] disabled:opacity-40 disabled:hover:bg-[#2F80ED] text-xs font-semibold transition-all shadow-xs shrink-0"
        >
          <span className="hidden sm:inline">Share Perspective</span>
          <span className="sm:hidden">Share</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
};
