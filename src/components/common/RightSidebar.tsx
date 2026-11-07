import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MessageSquare, Users, Sparkles, ArrowRight } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const {
    posts,
    allUsers,
    currentUser,
    toggleFollowUser,
    openPostDetails,
    openUserProfile,
    navigateTo,
    setSearchQuery,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigateTo('search');
    }
  };

  // Top trending discussions sorted by commentsCount
  const trendingDiscussions = [...posts]
    .sort((a, b) => b.commentsCount - a.commentsCount)
    .slice(0, 4);

  // Suggested thinkers (excluding current user)
  const suggestedThinkers = allUsers
    .filter((u) => u.id !== currentUser.id)
    .slice(0, 3);

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-80 h-screen sticky top-0 p-5 overflow-y-auto border-l border-slate-200/80 bg-white select-none shrink-0">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search discussions & ideas..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </form>

      {/* The Comentosh Ethos Card */}
      <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
          <Sparkles className="w-4 h-4 text-[#2F80ED]" />
          <span>The Comentosh Ethos</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          We killed the Post Like button. Social media shouldn't be about collecting passive clicks—it should be about dialogue, constructive debate, and thoughtful replies.
        </p>
        <button
          onClick={() => navigateTo('about')}
          className="text-xs font-medium text-[#2F80ED] hover:underline flex items-center gap-1 mt-1"
        >
          <span>Read our manifesto</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Popular Discussions */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Popular Discussions
          </h3>
          <button
            onClick={() => navigateTo('trending')}
            className="text-xs font-medium text-[#2F80ED] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="w-full flex flex-col gap-2">
          {trendingDiscussions.map((post) => (
            <div
              key={post.id}
              onClick={() => openPostDetails(post.id)}
              className="w-full p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                <span>{post.topic}</span>
                <span aria-hidden="true">·</span>
                <span>{post.createdAt}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-[#2F80ED] transition-colors leading-snug">
                {post.content.split('\n')[0]}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-[#2F80ED] font-medium">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} comments</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.participantsCount} thinkers</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Thinkers */}
      <div className="w-full flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Suggested Thinkers
          </h3>
          <button
            onClick={() => navigateTo('explore')}
            className="text-xs font-medium text-[#2F80ED] hover:underline"
          >
            Explore
          </button>
        </div>

        <div className="w-full flex flex-col gap-3">
          {suggestedThinkers.map((user) => (
            <div
              key={user.id}
              className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                onClick={() => openUserProfile(user.id)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200"
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-[#2F80ED] transition-colors truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.totalCommentLikes.toLocaleString()} comment likes
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(user.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  user.isFollowing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button onClick={() => navigateTo('about')} className="hover:text-slate-600">
            About
          </button>
          <span>·</span>
          <button onClick={() => navigateTo('explore')} className="hover:text-slate-600">
            Explore
          </button>
          <span>·</span>
          <button onClick={() => navigateTo('settings')} className="hover:text-slate-600">
            Guidelines
          </button>
          <span>·</span>
          <button onClick={() => navigateTo('about')} className="hover:text-slate-600">
            Cloudflare D1 Ready
          </button>
        </div>
        <p className="text-slate-400">Comentosh © 2026 · Where Conversations Matter</p>
      </div>
    </aside>
  );
};
