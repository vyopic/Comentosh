import React from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { TrendingUp, Flame, MessageSquare, Users, Sparkles } from 'lucide-react';

export const TrendingPage: React.FC = () => {
  const { posts } = useApp();

  // Sort posts by engagement (commentsCount descending)
  const trendingPosts = [...posts].sort((a, b) => b.commentsCount - a.commentsCount);

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Header */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-bold text-slate-900">Trending Discussions</h1>
        </div>
        <p className="text-xs text-slate-500">
          Ranked by conversational depth, active participant breadth, and high-quality comment exchanges.
        </p>
      </div>

      {/* Trending List with Rank Badges */}
      <div className="w-full flex flex-col gap-3 sm:gap-4">
        {trendingPosts.map((post, idx) => (
          <div key={post.id} className="w-full relative">
            {/* Rank Label */}
            <div className="flex items-center gap-2 mb-1.5 px-4 sm:px-1">
              <span className="text-xs font-extrabold text-slate-400">#{idx + 1}</span>
              <span className="text-[11px] font-semibold text-slate-600">
                {idx === 0
                  ? 'Most Active Community Thread'
                  : idx === 1
                  ? 'High Thought Velocity'
                  : 'Rising Dialogue'}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[11px] text-[#2F80ED] font-medium">
                {post.commentsCount} comments
              </span>
            </div>

            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};
