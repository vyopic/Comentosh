import React from 'react';
import { useApp } from '../context/AppContext';
import { POPULAR_TOPICS } from '../data/initialData';
import { PostCard } from '../components/feed/PostCard';
import {
  Compass,
  Code,
  Palette,
  Brain,
  Feather,
  Globe,
  Cpu,
  TrendingUp,
  MessageSquare,
  Users,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { posts, allUsers, currentUser, toggleFollowUser, setSelectedTopic, openUserProfile, navigateTo } = useApp();

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code className="w-5 h-5 text-[#2F80ED]" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-indigo-500" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-emerald-500" />;
      case 'feather':
        return <Feather className="w-5 h-5 text-amber-500" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-cyan-500" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-rose-500" />;
      default:
        return <Compass className="w-5 h-5 text-[#2F80ED]" />;
    }
  };

  const handleSelectTopic = (topicName: string) => {
    setSelectedTopic(topicName);
    navigateTo('home');
  };

  // Featured discussion (highest comment count)
  const featuredPost = [...posts].sort((a, b) => b.commentsCount - a.commentsCount)[0];

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Header */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-[#2F80ED]" />
          <h1 className="text-base font-bold text-slate-900">Explore Discussions</h1>
        </div>
        <p className="text-xs text-slate-500">
          Discover active communities, high-velocity debates, and thinkers pushing intellectual boundaries.
        </p>
      </div>

      {/* Featured Debate Showcase */}
      {featuredPost && (
        <div className="w-full bg-slate-900 rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-800 p-4 sm:p-5 text-white flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>Debate of the Day</span>
            </span>
            <span>{featuredPost.topic}</span>
          </div>

          <h2 className="text-sm md:text-base font-bold text-slate-100 line-clamp-2">
            {featuredPost.content.split('\n')[0]}
          </h2>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1 text-blue-300 font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{featuredPost.commentsCount} comments</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{featuredPost.participantsCount} participants</span>
              </span>
            </div>

            <button
              onClick={() => navigateTo('post_details', { postId: featuredPost.id })}
              className="px-3.5 py-1.5 rounded-lg bg-[#2F80ED] text-white font-semibold text-xs hover:bg-[#256fd1] transition-colors"
            >
              Join Discussion
            </button>
          </div>
        </div>
      )}

      {/* Topics Channels Grid */}
      <div className="w-full flex flex-col gap-3 px-4 sm:px-0">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Browse by Intellectual Domain
        </h2>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_TOPICS.map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleSelectTopic(topic.name)}
              className="p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 hover:border-[#2F80ED]/60 transition-all cursor-pointer group shadow-xs hover:shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {getTopicIcon(topic.icon)}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#2F80ED] transition-colors">
                {topic.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {topic.postCount} Active discussions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Thinkers Grid */}
      <div className="w-full flex flex-col gap-3 px-4 sm:px-0">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Thought Leaders in the Network
        </h2>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allUsers
            .filter((u) => u.id !== currentUser.id)
            .map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
              >
                <div
                  onClick={() => openUserProfile(user.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#2F80ED] transition-colors truncate">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    {user.totalCommentLikes.toLocaleString()} comment likes
                  </span>
                  <button
                    onClick={() => toggleFollowUser(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      user.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
