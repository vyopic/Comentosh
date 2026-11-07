import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { CommentItem } from '../components/comments/CommentItem';
import {
  Calendar,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Edit3,
  Check,
  UserCheck,
  UserPlus,
  X,
  Camera,
  Upload,
  Sparkles,
  Share2,
  Settings,
  Phone,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    allUsers,
    viewingUserId,
    posts,
    comments,
    toggleFollowUser,
    updateUserProfile,
    openPostDetails,
    showToast,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'discussions' | 'comments' | 'saved'>('discussions');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Profile being viewed
  const profileUser =
    (viewingUserId && allUsers.find((u) => u.id === viewingUserId)) || currentUser;
  const isSelf = profileUser.id === currentUser.id;

  // Edit form state
  const [name, setName] = useState(profileUser.name);
  const [username, setUsername] = useState(profileUser.username);
  const [bio, setBio] = useState(profileUser.bio);
  const [headline, setHeadline] = useState(profileUser.headline || '');
  const [phoneNumber, setPhoneNumber] = useState(profileUser.phoneNumber || '');
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync state when profileUser changes
  useEffect(() => {
    setName(profileUser.name);
    setUsername(profileUser.username);
    setBio(profileUser.bio);
    setHeadline(profileUser.headline || '');
    setPhoneNumber(profileUser.phoneNumber || '');
    setAvatar(profileUser.avatar);
  }, [profileUser]);

  // Handle image upload from user device
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/#profile-${profileUser.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
    }
    showToast(`Profile link for @${profileUser.username} copied!`, 'info');
  };

  // User posts
  const userPosts = posts.filter((p) => p.author.id === profileUser.id);
  // User comments
  const userComments = comments.filter((c) => c.author.id === profileUser.id);
  // Saved posts (for self)
  const savedPosts = posts.filter((p) => p.isSaved);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedUsername = username.trim().replace(/^@+/, '').toLowerCase();
    if (!sanitizedUsername) {
      showToast('Please enter a valid username handle', 'alert');
      return;
    }
    updateUserProfile({
      name: name.trim(),
      username: sanitizedUsername,
      bio: bio.trim(),
      headline: headline.trim(),
      phoneNumber: phoneNumber.trim(),
      avatar,
    });
    setIsEditModalOpen(false);
    showToast('Profile and username updated successfully!', 'success');
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Profile Card */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 object-cover border-2 border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{profileUser.name}</h1>
                {profileUser.isVerified && (
                  <span className="text-[#2F80ED] text-xs font-bold" title="Verified Thinker">
                    ●
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">@{profileUser.username}</p>
              {profileUser.phoneNumber && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                  <Phone className="w-3 h-3 text-[#2F80ED]" />
                  <span className="font-mono">{profileUser.phoneNumber}</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded-md border border-emerald-200">
                    Verified
                  </span>
                </div>
              )}
              {profileUser.headline && (
                <p className="text-xs font-medium text-slate-600 mt-1">{profileUser.headline}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              title="Share profile link"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Profile</span>
            </button>

            {isSelf ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => navigateTo('settings')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                  title="Settings & Log Out"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Settings</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => toggleFollowUser(profileUser.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  profileUser.isFollowing
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-[#2F80ED] text-white hover:bg-[#256fd1]'
                }`}
              >
                {profileUser.isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed w-full">
          {profileUser.bio}
        </p>

        {/* Comentosh Reputation Metrics Grid (Comment-First Philosophy) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl flex flex-col">
            <span className="text-[11px] font-medium text-slate-400">Comment Likes</span>
            <span className="text-base sm:text-lg font-extrabold text-[#2F80ED] mt-0.5">
              {profileUser.totalCommentLikes.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl flex flex-col">
            <span className="text-[11px] font-medium text-slate-400">Comments Written</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {profileUser.totalComments.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl flex flex-col">
            <span className="text-[11px] font-medium text-slate-400">Discussions Started</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {profileUser.discussionsStarted.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl flex flex-col">
            <span className="text-[11px] font-medium text-slate-400">Followers</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {profileUser.followersCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Member since */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{profileUser.joinedDate}</span>
        </div>
      </div>

      {/* Segmented Profile Tabs */}
      <div className="w-full flex items-center gap-1 p-1 bg-slate-100/90 rounded-none sm:rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('discussions')}
          className={`flex-1 sm:flex-none text-center px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'discussions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Discussions ({userPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 sm:flex-none text-center px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'comments'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Comments ({userComments.length})
        </button>
        {isSelf && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none text-center px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Threads ({savedPosts.length})
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="w-full flex flex-col gap-4">
        {activeTab === 'discussions' && (
          userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No discussions started yet.
            </div>
          )
        )}

        {activeTab === 'comments' && (
          userComments.length > 0 ? (
            userComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-2">
                <div
                  onClick={() => openPostDetails(comment.postId)}
                  className="text-xs text-slate-500 hover:text-[#2F80ED] cursor-pointer flex items-center gap-1 font-medium pl-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>View discussion thread →</span>
                </div>
                <CommentItem comment={comment} />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No comments written yet.
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedPosts.length > 0 ? (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              You haven't saved any discussions yet.
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-4">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center justify-center gap-2.5 pb-3 border-b border-slate-100">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  title="Click to change profile picture"
                >
                  <img
                    src={avatar}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#2F80ED] shadow-xs bg-slate-100"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-semibold mt-0.5">Upload</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#2F80ED]" />
                    <span>Upload Picture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const seed = Math.random().toString(36).substring(7);
                      setAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Generate Avatar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username Handle</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="username"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Unique handle (letters, numbers, and underscores only).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mobile Phone Number <span className="text-[#2F80ED]">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mandatory phone verification number (required on Comentosh).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Cognitive Science Researcher"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#2F80ED] text-white hover:bg-[#256fd1] rounded-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
