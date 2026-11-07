export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  headline?: string;
  joinedDate: string;
  followingCount: number;
  followersCount: number;
  totalComments: number;
  totalCommentLikes: number;
  discussionsStarted: number;
  isVerified?: boolean;
  isFollowing?: boolean;
  phoneNumber?: string;
}

export interface CommentReaction {
  type: 'agree' | 'insightful' | 'thoughtful' | 'applause';
  count: number;
}

export interface Reply {
  id: string;
  commentId: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLikedByMe?: boolean;
  replyToUsername?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLikedByMe?: boolean;
  isPinnedByAuthor?: boolean;
  isTopComment?: boolean;
  replies: Reply[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  topic: string;
  images?: string[];
  createdAt: string;
  commentsCount: number;
  participantsCount: number;
  viewsCount: number;
  sharesCount: number;
  isSaved?: boolean;
  topComment?: Comment; // Spotlight top comment for comment-first feed presentation
  isPinned?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'comment_reply' | 'comment_like' | 'post_comment' | 'mention' | 'milestone';
  actor: User;
  postId: string;
  commentId?: string;
  contentSnippet: string;
  createdAt: string;
  isRead: boolean;
}

export type PageView = 
  | 'home'
  | 'explore'
  | 'trending'
  | 'post_details'
  | 'profile'
  | 'create_post'
  | 'notifications'
  | 'search'
  | 'login'
  | 'signup'
  | 'settings'
  | 'about';

export type CommentSortOrder = 'most_liked' | 'newest' | 'most_replies' | 'oldest';
