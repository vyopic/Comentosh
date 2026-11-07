import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Comment, Reply, NotificationItem, PageView, CommentSortOrder } from '../types';
import { CURRENT_USER, DEMO_USERS, INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { api } from '../services/api';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'alert';
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  posts: Post[];
  comments: Comment[];
  notifications: NotificationItem[];
  activePage: PageView;
  selectedPostId: string | null;
  viewingUserId: string | null;
  searchQuery: string;
  selectedTopic: string | null;
  isCreateModalOpen: boolean;
  toasts: ToastMessage[];
  isLoadingPosts: boolean;
  apiError: string | null;
  refreshFeed: (topic?: string, filter?: string) => Promise<void>;
  refreshComments: (postId: string) => Promise<void>;
  
  // Navigation actions
  navigateTo: (page: PageView, options?: { postId?: string; userId?: string; topic?: string }) => void;
  openPostDetails: (postId: string) => void;
  openUserProfile: (userId: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedTopic: (topic: string | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'alert') => void;
  dismissToast: (id: string) => void;

  // User actions
  switchUser: (userId: string) => void;
  toggleFollowUser: (userId: string) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  loginUser: (identifier: string, password: string) => Promise<boolean>;
  registerUser: (data: {
    username: string;
    password: string;
    phoneNumber: string;
    name?: string;
    bio?: string;
  }) => Promise<boolean>;
  logout: () => void;

  // Post actions
  createPost: (data: { content: string; topic: string; images?: string[] }) => string;
  editPost: (postId: string, data: { content: string; topic: string; images?: string[] }) => void;
  deletePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  sharePost: (postId: string) => void;

  // Comment actions
  addComment: (postId: string, content: string) => void;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  
  // Reply actions
  addReply: (commentId: string, content: string, replyToUsername?: string) => void;
  toggleReplyLike: (replyId: string) => void;
  deleteReply: (replyId: string) => void;

  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('comentosh_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS);

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('comentosh_posts');
    if (!saved) return INITIAL_POSTS;
    try {
      const parsed: Post[] = JSON.parse(saved);
      return parsed.map((p) => ({
        ...p,
        images: p.images?.filter((img) => !img.startsWith('blob:'))?.length
          ? p.images.filter((img) => !img.startsWith('blob:'))
          : undefined,
      }));
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('comentosh_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('comentosh_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activePage, setActivePage] = useState<PageView>('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>('post_1');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const refreshFeed = async (topic?: string, filter?: string) => {
    setIsLoadingPosts(true);
    setApiError(null);
    try {
      const feedPosts = await api.getFeed(topic, filter);
      if (feedPosts) {
        setPosts(feedPosts);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to load feed from Cloudflare D1');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const refreshComments = async (postId: string) => {
    try {
      const backendComments = await api.getComments(postId);
      if (backendComments) {
        setComments((prev) => {
          const others = prev.filter((c) => c.postId !== postId);
          return [...backendComments, ...others];
        });
      }
    } catch (err: any) {
      console.warn('Comments refresh error:', err);
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('comentosh_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('comentosh_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('comentosh_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('comentosh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Initial synchronization with Cloudflare D1 Backend
  useEffect(() => {
    let isMounted = true;

    async function syncFromBackend() {
      try {
        // 1. Check session
        const meRes = await api.getMe().catch(() => null);
        if (meRes?.user && isMounted) {
          setCurrentUser(meRes.user);
        }

        // 2. Fetch fresh feed
        const backendPosts = await api.getFeed().catch(() => null);
        if (backendPosts && backendPosts.length > 0 && isMounted) {
          setPosts(backendPosts);
        }

        // 3. Fetch thinkers
        const backendUsers = await api.getUsers().catch(() => null);
        if (backendUsers && backendUsers.length > 0 && isMounted) {
          setAllUsers(backendUsers);
        }

        // 4. Fetch notifications
        if (meRes?.user) {
          const backendNotifs = await api.getNotifications().catch(() => null);
          if (backendNotifs && isMounted) {
            setNotifications(backendNotifs);
          }
        }
      } catch (err) {
        console.warn('[D1 Backend Sync] Fallback to cache:', err);
      }
    }

    syncFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch comments from Cloudflare D1 whenever selected post changes
  useEffect(() => {
    if (!selectedPostId) return;
    let isMounted = true;

    api.getComments(selectedPostId)
      .then((backendComments) => {
        if (backendComments && backendComments.length > 0 && isMounted) {
          setComments((prev) => {
            const others = prev.filter((c) => c.postId !== selectedPostId);
            return [...backendComments, ...others];
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedPostId]);

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (page: PageView, options?: { postId?: string; userId?: string; topic?: string }) => {
    setActivePage(page);
    if (options?.postId) setSelectedPostId(options.postId);
    if (options?.userId) setViewingUserId(options.userId);
    if (options?.topic !== undefined) setSelectedTopic(options.topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPostDetails = (postId: string) => {
    setSelectedPostId(postId);
    setActivePage('post_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setActivePage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched active perspective to ${user.name}`, 'info');
    }
  };

  const loginUser = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login(identifier, password);
      if (res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'alert');
      return false;
    }
  };

  const registerUser = async (data: {
    username: string;
    password: string;
    phoneNumber: string;
    name?: string;
    bio?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome to Comentosh, @${res.user.username}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'alert');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('comentosh_user');
    localStorage.removeItem('comentosh_token');
    api.logout().catch(() => {});
    setCurrentUser(CURRENT_USER);
    setActivePage('login');
    showToast('You have been logged out of your account', 'info');
  };

  const toggleFollowUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextState = !u.isFollowing;
          showToast(nextState ? `Following ${u.name}` : `Unfollowed ${u.name}`, 'info');
          return {
            ...u,
            isFollowing: nextState,
            followersCount: nextState ? u.followersCount + 1 : u.followersCount - 1,
          };
        }
        return u;
      })
    );
    api.toggleFollow(userId).catch((err) => console.warn('Follow sync error:', err));
  };

  const updateUserProfile = (updatedFields: Partial<User>) => {
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

    // Propagate avatar, name, and headline to all posts and comments authored by this user
    setPosts((prev) =>
      prev.map((p) => {
        const isAuthor = p.author.id === updated.id;
        const hasTopCommentAuthor = p.topComment?.author.id === updated.id;
        return {
          ...p,
          author: isAuthor ? { ...p.author, ...updatedFields } : p.author,
          topComment: p.topComment
            ? {
                ...p.topComment,
                author: hasTopCommentAuthor
                  ? { ...p.topComment.author, ...updatedFields }
                  : p.topComment.author,
              }
            : undefined,
        };
      })
    );

    setComments((prev) =>
      prev.map((c) => {
        const isAuthor = c.author.id === updated.id;
        return {
          ...c,
          author: isAuthor ? { ...c.author, ...updatedFields } : c.author,
          replies: c.replies.map((r) =>
            r.author.id === updated.id
              ? { ...r, author: { ...r.author, ...updatedFields } }
              : r
          ),
        };
      })
    );

    showToast('Profile updated successfully', 'success');
    api.updateProfile(updatedFields).catch((err) => console.warn('Profile sync error:', err));
  };

  // Post Operations
  const createPost = (data: { content: string; topic: string; images?: string[] }): string => {
    const newPostId = 'post_' + Date.now();
    const newPost: Post = {
      id: newPostId,
      author: currentUser,
      content: data.content,
      topic: data.topic,
      images: data.images && data.images.length > 0 ? data.images : undefined,
      createdAt: 'Just now',
      commentsCount: 0,
      participantsCount: 1,
      viewsCount: 1,
      sharesCount: 0,
      isSaved: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      discussionsStarted: prev.discussionsStarted + 1,
    }));
    showToast('Discussion published to Comentosh', 'success');

    // Sync to Cloudflare D1
    api.createPost(data).then((res) => {
      if (res.post) {
        setPosts((prev) => prev.map((p) => (p.id === newPostId ? res.post : p)));
      }
    }).catch((err) => console.warn('Create post sync error:', err));

    return newPostId;
  };

  const editPost = (postId: string, data: { content: string; topic: string; images?: string[] }) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            content: data.content,
            topic: data.topic,
            images: data.images,
          };
        }
        return p;
      })
    );
    showToast('Discussion updated', 'success');
    api.editPost(postId, data).catch((err) => console.warn('Edit post sync error:', err));
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => prev.filter((c) => c.postId !== postId));
    if (selectedPostId === postId) {
      setActivePage('home');
    }
    showToast('Discussion removed', 'alert');
    api.deletePost(postId).catch((err) => console.warn('Delete post sync error:', err));
  };

  const toggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          showToast(nextSaved ? 'Saved to your reading list' : 'Removed from saved', 'info');
          return { ...p, isSaved: nextSaved };
        }
        return p;
      })
    );
    api.toggleSavePost(postId).catch((err) => console.warn('Toggle save sync error:', err));
  };

  const sharePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${postId}`);
    }
    showToast('Discussion link copied to clipboard', 'success');
    api.sharePost(postId).catch((err) => console.warn('Share post sync error:', err));
  };

  // Comment Operations
  const addComment = (postId: string, content: string) => {
    const newCommentId = 'cmt_' + Date.now();
    const newComment: Comment = {
      id: newCommentId,
      postId,
      author: currentUser,
      content,
      createdAt: 'Just now',
      likesCount: 0,
      isLikedByMe: false,
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);

    // Update post comments count and recalculate participants
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextCommentsCount = p.commentsCount + 1;
          return {
            ...p,
            commentsCount: nextCommentsCount,
            participantsCount: p.participantsCount + 1,
            // If post had no top comment, make this the preview
            topComment: p.topComment || newComment,
          };
        }
        return p;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      totalComments: prev.totalComments + 1,
    }));

    // Trigger notification for the post author if not self
    const post = posts.find((p) => p.id === postId);
    if (post && post.author.id !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        type: 'post_comment',
        actor: currentUser,
        postId,
        commentId: newCommentId,
        contentSnippet: `${currentUser.name} commented on your discussion: "${content.slice(0, 60)}..."`,
        createdAt: 'Just now',
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast('Your perspective has been added to the discussion', 'success');
    api.addComment(postId, content).then((serverComment) => {
      if (serverComment) {
        setComments((prev) => prev.map((c) => (c.id === newCommentId ? serverComment : c)));
      }
    }).catch((err) => console.warn('Comment sync error:', err));
  };

  const editComment = (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content } : c))
    );
    showToast('Comment updated', 'success');
    api.editComment(commentId, content).catch((err) => console.warn('Edit comment sync error:', err));
  };

  const deleteComment = (commentId: string) => {
    const commentToDelete = comments.find((c) => c.id === commentId);
    if (!commentToDelete) return;

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === commentToDelete.postId) {
          const nextCount = Math.max(0, p.commentsCount - 1);
          return {
            ...p,
            commentsCount: nextCount,
            topComment: p.topComment?.id === commentId ? undefined : p.topComment,
          };
        }
        return p;
      })
    );
    showToast('Comment deleted', 'alert');
    api.deleteComment(commentId).catch((err) => console.warn('Delete comment sync error:', err));
  };

  const toggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const wasLiked = c.isLikedByMe;
          const nextLikes = wasLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1;
          
          if (!wasLiked && c.author.id !== currentUser.id) {
            // Notify comment author
            const newNotif: NotificationItem = {
              id: 'notif_' + Date.now(),
              type: 'comment_like',
              actor: currentUser,
              postId: c.postId,
              commentId: c.id,
              contentSnippet: `${currentUser.name} agreed with your comment: "${c.content.slice(0, 50)}..."`,
              createdAt: 'Just now',
              isRead: false,
            };
            setNotifications((n) => [newNotif, ...n]);
          }

          return {
            ...c,
            likesCount: nextLikes,
            isLikedByMe: !wasLiked,
          };
        }
        return c;
      })
    );
    api.toggleCommentLike(commentId).catch((err) => console.warn('Like sync error:', err));
  };

  // Reply Operations
  const addReply = (commentId: string, content: string, replyToUsername?: string) => {
    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    const newReply: Reply = {
      id: 'rep_' + Date.now(),
      commentId,
      postId: targetComment.postId,
      author: currentUser,
      content,
      createdAt: 'Just now',
      likesCount: 0,
      isLikedByMe: false,
      replyToUsername: replyToUsername || targetComment.author.username,
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...c.replies, newReply],
          };
        }
        return c;
      })
    );

    // Update post comments count
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === targetComment.postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
          };
        }
        return p;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      totalComments: prev.totalComments + 1,
    }));

    if (targetComment.author.id !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        type: 'comment_reply',
        actor: currentUser,
        postId: targetComment.postId,
        commentId,
        contentSnippet: `${currentUser.name} replied to your comment: "${content.slice(0, 50)}..."`,
        createdAt: 'Just now',
        isRead: false,
      };
      setNotifications((n) => [newNotif, ...n]);
    }

    showToast('Reply published', 'success');
    api.addReply(commentId, content).catch((err) => console.warn('Reply sync error:', err));
  };

  const toggleReplyLike = (replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        const hasReply = c.replies.some((r) => r.id === replyId);
        if (!hasReply) return c;
        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r.id === replyId) {
              const wasLiked = r.isLikedByMe;
              return {
                ...r,
                isLikedByMe: !wasLiked,
                likesCount: wasLiked ? Math.max(0, r.likesCount - 1) : r.likesCount + 1,
              };
            }
            return r;
          }),
        };
      })
    );
  };

  const deleteReply = (replyId: string) => {
    setComments((prev) =>
      prev.map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== replyId),
      }))
    );
    showToast('Reply deleted', 'alert');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    api.markNotificationRead(notificationId).catch((err) => console.warn('Notif read sync error:', err));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
    api.markAllNotificationsRead().catch((err) => console.warn('Notifs read-all sync error:', err));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        posts,
        comments,
        notifications,
        activePage,
        selectedPostId,
        viewingUserId,
        searchQuery,
        selectedTopic,
        isCreateModalOpen,
        toasts,
        navigateTo,
        openPostDetails,
        openUserProfile,
        setSearchQuery,
        setSelectedTopic,
        setIsCreateModalOpen,
        showToast,
        dismissToast,
        switchUser,
        toggleFollowUser,
        updateUserProfile,
        loginUser,
        registerUser,
        logout,
        createPost,
        editPost,
        deletePost,
        toggleSavePost,
        sharePost,
        addComment,
        editComment,
        deleteComment,
        toggleCommentLike,
        addReply,
        toggleReplyLike,
        deleteReply,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        isLoadingPosts,
        apiError,
        refreshFeed,
        refreshComments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
