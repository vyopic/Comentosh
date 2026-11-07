import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { PlusCircle, Flame, Users, Sparkles, Filter } from 'lucide-react';
import { POPULAR_TOPICS } from '../data/initialData';

export const HomeFeed: React.FC = () => {
  const { posts, currentUser, setIsCreateModalOpen, selectedTopic, setSelectedTopic } = useApp();
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'trending'>('for_you');

  // Filter posts based on activeTab and selectedTopic
  const filteredPosts = posts.filter((post) => {
    if (selectedTopic && post.topic !== selectedTopic) {
      return false;
    }

    if (activeTab === 'following') {
      // In a real app or demo, posts from authors you follow or self
      return post.author.isFollowing || post.author.id === currentUser.id;
    }

    return true;
  });

  const displayPosts = activeTab === 'trending'
    ? [...filteredPosts].sort((a, b) => b.commentsCount - a.commentsCount)
    : filteredPosts;

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-5">
      {/* Top Banner & Segmented Feed Tabs */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`flex-1 sm:flex-none text-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'for_you'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 sm:flex-none text-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'following'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 sm:flex-none text-center px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'trending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trending
          </button>
        </div>

        {/* Clear topic filter if active */}
        {selectedTopic && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filtered by:</span>
            <span className="font-semibold text-[#2F80ED]">{selectedTopic}</span>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-slate-400 hover:text-slate-700 underline text-[11px]"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Quick Discussion Prompt Box */}
      <div
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-3.5 sm:p-5 shadow-xs hover:border-[#2F80ED]/50 transition-all cursor-pointer flex items-center gap-3 sm:gap-3.5 group"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 transition-colors line-clamp-2">
            What thought or question do you want to explore with thinkers today?
          </p>
        </div>
        <button
          type="button"
          className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 group-hover:bg-[#2F80ED] text-slate-600 group-hover:text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Discuss</span>
        </button>
      </div>

      {/* Topic Horizontal Quick Filter */}
      <div className="w-full flex items-center gap-2 overflow-x-auto px-3 sm:px-0 py-1.5 no-scrollbar text-xs touch-pan-x">
        <button
          onClick={() => setSelectedTopic(null)}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            selectedTopic === null
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Topics
        </button>
        {POPULAR_TOPICS.map((top) => (
          <button
            key={top.id}
            onClick={() => setSelectedTopic(top.name === selectedTopic ? null : top.name)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              selectedTopic === top.name
                ? 'bg-[#2F80ED] text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {top.name}
          </button>
        ))}
      </div>

      {/* Discussions Feed List */}
      <div className="w-full flex flex-col gap-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200 p-8 text-center flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">No discussions found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {activeTab === 'following'
                ? 'You are not following any thinkers with posts yet. Check out the For You feed to discover active conversations.'
                : 'No conversations match the current topic filter.'}
            </p>
            <button
              onClick={() => {
                setActiveTab('for_you');
                setSelectedTopic(null);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#2F80ED] text-white text-xs font-semibold"
            >
              Explore All Discussions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
