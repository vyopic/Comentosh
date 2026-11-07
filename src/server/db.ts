// Cloudflare D1 Database Helper Operations
import { D1Database, UserRow, PostRow, CommentRow, NotificationRow, SessionRow } from './types';
import { User, Post, Comment, Reply, NotificationItem } from '../types';

export async function getUserFromSession(db: D1Database, token: string): Promise<User | null> {
  if (!token) return null;

  const nowIso = new Date().toISOString();
  const session = await db
    .prepare('SELECT user_id, expires_at FROM sessions WHERE token = ? AND expires_at > ?')
    .bind(token, nowIso)
    .first<SessionRow>();

  if (!session || !session.user_id) return null;
  return getUserProfile(db, session.user_id);
}

export async function getUserProfile(
  db: D1Database,
  userIdOrUsername: string,
  currentUserId?: string
): Promise<User | null> {
  const isId = userIdOrUsername.startsWith('usr_') || userIdOrUsername.startsWith('u_');
  const query = isId
    ? 'SELECT * FROM users WHERE id = ?'
    : 'SELECT * FROM users WHERE username = ?';

  const userRow = await db.prepare(query).bind(userIdOrUsername).first<UserRow>();
  if (!userRow) return null;

  // Aggregate stats
  const followersCountRes = await db
    .prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?')
    .bind(userRow.id)
    .first<{ count: number }>();

  const followingCountRes = await db
    .prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?')
    .bind(userRow.id)
    .first<{ count: number }>();

  const commentsCountRes = await db
    .prepare('SELECT COUNT(*) as count FROM comments WHERE user_id = ?')
    .bind(userRow.id)
    .first<{ count: number }>();

  const postsCountRes = await db
    .prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?')
    .bind(userRow.id)
    .first<{ count: number }>();

  const commentLikesRes = await db
    .prepare(`
      SELECT COUNT(*) as count 
      FROM comment_likes cl
      JOIN comments c ON cl.comment_id = c.id
      WHERE c.user_id = ?
    `)
    .bind(userRow.id)
    .first<{ count: number }>();

  let isFollowing = false;
  if (currentUserId && currentUserId !== userRow.id) {
    const followCheck = await db
      .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
      .bind(currentUserId, userRow.id)
      .first<{ id: string }>();
    isFollowing = !!followCheck;
  }

  return {
    id: userRow.id,
    name: userRow.name,
    username: userRow.username,
    avatar: userRow.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${userRow.username}`,
    bio: userRow.bio || '',
    headline: userRow.headline || undefined,
    phoneNumber: userRow.phone_number || undefined,
    joinedDate: formatFriendlyDate(userRow.created_at),
    followersCount: followersCountRes?.count || 0,
    followingCount: followingCountRes?.count || 0,
    totalComments: commentsCountRes?.count || 0,
    totalCommentLikes: commentLikesRes?.count || 0,
    discussionsStarted: postsCountRes?.count || 0,
    isVerified: Boolean(userRow.is_verified),
    isFollowing,
  };
}

export async function getAllUsers(db: D1Database, currentUserId?: string): Promise<User[]> {
  const res = await db.prepare('SELECT id FROM users ORDER BY created_at ASC').all<{ id: string }>();
  const users: User[] = [];
  for (const row of res.results || []) {
    const u = await getUserProfile(db, row.id, currentUserId);
    if (u) users.push(u);
  }
  return users;
}

export async function getFeedPosts(
  db: D1Database,
  currentUserId?: string,
  topic?: string,
  filter?: string
): Promise<Post[]> {
  let query = 'SELECT * FROM posts';
  const params: unknown[] = [];

  if (topic && topic !== 'All') {
    query += ' WHERE topic = ?';
    params.push(topic);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const stmt = db.prepare(query);
  const postRows = (await (params.length ? stmt.bind(...params) : stmt).all<PostRow>()).results || [];

  const posts: Post[] = [];

  for (const row of postRows) {
    const author = await getUserProfile(db, row.user_id, currentUserId);
    if (!author) continue;

    // Comments count
    const commentCountRes = await db
      .prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?')
      .bind(row.id)
      .first<{ count: number }>();

    // Unique participants count
    const participantsRes = await db
      .prepare('SELECT COUNT(DISTINCT user_id) as count FROM comments WHERE post_id = ?')
      .bind(row.id)
      .first<{ count: number }>();

    // Is saved by me
    let isSaved = false;
    if (currentUserId) {
      const savedRes = await db
        .prepare('SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?')
        .bind(currentUserId, row.id)
        .first<{ id: string }>();
      isSaved = !!savedRes;
    }

    // Top comment spotlight (highest likes root comment)
    const topCommentRow = await db
      .prepare(`
        SELECT c.*, COUNT(cl.id) as likes_count
        FROM comments c
        LEFT JOIN comment_likes cl ON c.id = cl.comment_id
        WHERE c.post_id = ? AND c.parent_id IS NULL
        GROUP BY c.id
        ORDER BY likes_count DESC, c.created_at ASC
        LIMIT 1
      `)
      .bind(row.id)
      .first<CommentRow & { likes_count: number }>();

    let topComment: Comment | undefined;
    if (topCommentRow) {
      const topAuthor = await getUserProfile(db, topCommentRow.user_id, currentUserId);
      if (topAuthor) {
        let isLiked = false;
        if (currentUserId) {
          const likeRes = await db
            .prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?')
            .bind(topCommentRow.id, currentUserId)
            .first<{ id: string }>();
          isLiked = !!likeRes;
        }

        topComment = {
          id: topCommentRow.id,
          postId: row.id,
          author: topAuthor,
          content: topCommentRow.content,
          createdAt: formatFriendlyDate(topCommentRow.created_at),
          likesCount: topCommentRow.likes_count || 0,
          isLikedByMe: isLiked,
          isTopComment: true,
          replies: [],
        };
      }
    }

    let images: string[] | undefined;
    if (row.images) {
      try {
        images = JSON.parse(row.images);
      } catch {
        images = undefined;
      }
    }

    posts.push({
      id: row.id,
      author,
      content: row.content,
      topic: row.topic,
      images,
      createdAt: formatFriendlyDate(row.created_at),
      commentsCount: commentCountRes?.count || 0,
      participantsCount: Math.max(1, (participantsRes?.count || 0) + 1),
      viewsCount: row.views_count || 1,
      sharesCount: row.shares_count || 0,
      isSaved,
      topComment,
    });
  }

  // Filter for 'Following' or 'Trending'
  if (filter === 'following' && currentUserId) {
    return posts.filter((p) => p.author.isFollowing || p.author.id === currentUserId);
  }

  if (filter === 'trending') {
    return posts.sort((a, b) => b.commentsCount - a.commentsCount);
  }

  return posts;
}

export async function getPostComments(
  db: D1Database,
  postId: string,
  currentUserId?: string
): Promise<Comment[]> {
  // 1. Fetch all root comments for this post
  const rootRows = (
    await db
      .prepare(`
        SELECT c.*, COUNT(cl.id) as likes_count
        FROM comments c
        LEFT JOIN comment_likes cl ON c.id = cl.comment_id
        WHERE c.post_id = ? AND c.parent_id IS NULL
        GROUP BY c.id
        ORDER BY likes_count DESC, c.created_at ASC
      `)
      .bind(postId)
      .all<CommentRow & { likes_count: number }>()
  ).results || [];

  const comments: Comment[] = [];

  for (let i = 0; i < rootRows.length; i++) {
    const row = rootRows[i];
    const author = await getUserProfile(db, row.user_id, currentUserId);
    if (!author) continue;

    let isLikedByMe = false;
    if (currentUserId) {
      const likeCheck = await db
        .prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?')
        .bind(row.id, currentUserId)
        .first<{ id: string }>();
      isLikedByMe = !!likeCheck;
    }

    // Fetch replies for this comment
    const replyRows = (
      await db
        .prepare(`
          SELECT c.*, COUNT(cl.id) as likes_count
          FROM comments c
          LEFT JOIN comment_likes cl ON c.id = cl.comment_id
          WHERE c.parent_id = ?
          GROUP BY c.id
          ORDER BY c.created_at ASC
        `)
        .bind(row.id)
        .all<CommentRow & { likes_count: number }>()
    ).results || [];

    const replies: Reply[] = [];
    for (const rRow of replyRows) {
      const rAuthor = await getUserProfile(db, rRow.user_id, currentUserId);
      if (!rAuthor) continue;

      let rLiked = false;
      if (currentUserId) {
        const rCheck = await db
          .prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?')
          .bind(rRow.id, currentUserId)
          .first<{ id: string }>();
        rLiked = !!rCheck;
      }

      replies.push({
        id: rRow.id,
        commentId: row.id,
        postId: row.post_id,
        author: rAuthor,
        content: rRow.content,
        createdAt: formatFriendlyDate(rRow.created_at),
        likesCount: rRow.likes_count || 0,
        isLikedByMe: rLiked,
      });
    }

    comments.push({
      id: row.id,
      postId: row.post_id,
      author,
      content: row.content,
      createdAt: formatFriendlyDate(row.created_at),
      likesCount: row.likes_count || 0,
      isLikedByMe,
      isTopComment: i === 0 && row.likes_count > 0,
      replies,
    });
  }

  return comments;
}

export async function getNotifications(
  db: D1Database,
  userId: string
): Promise<NotificationItem[]> {
  const rows = (
    await db
      .prepare(`
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
      `)
      .bind(userId)
      .all<NotificationRow>()
  ).results || [];

  const notifications: NotificationItem[] = [];

  for (const r of rows) {
    const actor = await getUserProfile(db, r.actor_id, userId);
    if (!actor) continue;

    notifications.push({
      id: r.id,
      type: r.type as NotificationItem['type'],
      actor,
      postId: r.target_id || '',
      commentId: r.type.includes('comment') ? r.target_id || undefined : undefined,
      contentSnippet: r.content_snippet || '',
      createdAt: formatFriendlyDate(r.created_at),
      isRead: Boolean(r.is_read),
    });
  }

  return notifications;
}

function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
