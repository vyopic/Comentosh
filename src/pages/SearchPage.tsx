import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { CommentItem } from '../components/comments/CommentItem';
import { Search, MessageSquare, Users, Sparkles, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const {
    posts,
    comments,
    allUsers,
    searchQuery,
    setSearchQuery,
    openPostDetails,
    openUserProfile,
    toggleFollowUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'discussions' | 'comments' | 'thinkers'>('all');

  const query = searchQuery.toLowerCase().trim();

  // Matched Posts
  const matchedPosts = query
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(query) ||
          p.topic.toLowerCase().includes(query) ||
          p.author.name.toLowerCase().includes(query)
      )
    : [];

  // Matched Comments
  const matchedComments = query
    ? comments.filter(
        (c) =>
          c.content.toLowerCase().includes(query) ||
          c.author.name.toLowerCase().includes(query)
      )
    : [];

  // Matched Users
  const matchedUsers = query
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.bio.toLowerCase().includes(query)
      )
    : [];

  const totalResults = matchedPosts.length + matchedComments.length + matchedUsers.length;

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Search Input Bar */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 shadow-xs">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions, perspectives, topics, or thinkers..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all"
            autoFocus
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        {query && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 p-1 bg-slate-100/80 rounded-xl w-full sm:w-fit overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'discussions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discussions ({matchedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'comments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comments ({matchedComments.length})
            </button>
            <button
              onClick={() => setActiveTab('thinkers')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'thinkers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thinkers ({matchedUsers.length})
            </button>
          </div>
        )}
      </div>

      {/* Results Container */}
      {!query ? (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-2">
          <Search className="w-8 h-8 text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-800">Search Comentosh</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Type keywords like "architecture", "dopamine", "typography", or author names to uncover conversations.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-2">
          <Sparkles className="w-8 h-8 text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-800">No matching results</h3>
          <p className="text-xs text-slate-500">
            We couldn't find any discussions or comments matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-5">
          {/* Thinkers matching */}
          {(activeTab === 'all' || activeTab === 'thinkers') && matchedUsers.length > 0 && (
            <div className="w-full flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Thinkers ({matchedUsers.length})
              </h3>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => openUserProfile(user.id)}
                      className="flex items-center gap-3 cursor-pointer group min-w-0"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-[#2F80ED] transition-colors truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                        user.isFollowing
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussions matching */}
          {(activeTab === 'all' || activeTab === 'discussions') && matchedPosts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Discussions ({matchedPosts.length})
              </h3>
              {matchedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Comments matching */}
          {(activeTab === 'all' || activeTab === 'comments') && matchedComments.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comments & Perspectives ({matchedComments.length})
              </h3>
              {matchedComments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-1.5">
                  <div
                    onClick={() => openPostDetails(comment.postId)}
                    className="text-xs text-[#2F80ED] hover:underline cursor-pointer flex items-center gap-1 font-medium pl-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>View parent discussion thread →</span>
                  </div>
                  <CommentItem comment={comment} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
