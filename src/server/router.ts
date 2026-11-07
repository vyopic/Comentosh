// Unified REST API Router for Cloudflare Workers & Pages Functions
import { Env, UserRow } from './types';
import { hashPassword, verifyPassword, generateRandomToken } from './crypto';
import {
  getUserFromSession,
  getUserProfile,
  getAllUsers,
  getFeedPosts,
  getPostComments,
  getNotifications,
} from './db';
import { seedDatabaseIfEmpty } from './seed';

// Simple in-memory rate limiter per IP/Session
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || record.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');
  const method = request.method.toUpperCase();

  // CORS Headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Rate Limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return jsonResponse({ error: 'Too many requests. Please slow down.' }, 429, corsHeaders);
  }

  // Auto-seed if database is new
  await seedDatabaseIfEmpty(env.DB);

  // Extract Session Token from Cookie or Bearer Header
  const sessionToken = extractSessionToken(request);
  const currentUser = sessionToken ? await getUserFromSession(env.DB, sessionToken) : null;

  try {
    // ----------------------------------------------------
    // 1. HEALTH CHECK
    // ----------------------------------------------------
    if (path === 'health' && method === 'GET') {
      return jsonResponse({ status: 'ok', database: 'connected', server: 'Cloudflare D1 Worker' }, 200, corsHeaders);
    }

    // ----------------------------------------------------
    // 2. AUTHENTICATION ENDPOINTS
    // ----------------------------------------------------

    // Current Authenticated Thinker
    if (path === 'auth/me' && method === 'GET') {
      if (!currentUser) {
        return jsonResponse({ user: null, authenticated: false }, 200, corsHeaders);
      }
      return jsonResponse({ user: currentUser, authenticated: true }, 200, corsHeaders);
    }

    // Register
    if (path === 'auth/register' && method === 'POST') {
      const body = await parseJsonBody(request);
      const { username, password, phoneNumber, name, bio, avatarUrl } = body;

      if (!username || !password || !phoneNumber) {
        return jsonResponse(
          { error: 'Username, password, and mobile phone number are mandatory.' },
          400,
          corsHeaders
        );
      }

      const cleanUsername = String(username).toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return jsonResponse({ error: 'Username must be at least 3 characters long.' }, 400, corsHeaders);
      }

      // Check if username already exists
      const existing = await env.DB
        .prepare('SELECT id FROM users WHERE username = ? OR phone_number = ?')
        .bind(cleanUsername, phoneNumber)
        .first<{ id: string }>();

      if (existing) {
        return jsonResponse(
          { error: 'An account with this username or mobile phone number already exists.' },
          409,
          corsHeaders
        );
      }

      const passwordHash = await hashPassword(password);
      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const defaultAvatar =
        avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}`;
      const nowIso = new Date().toISOString();

      await env.DB
        .prepare(`
          INSERT INTO users (id, username, email, phone_number, name, password_hash, avatar_url, bio, headline, is_verified, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `)
        .bind(
          newUserId,
          cleanUsername,
          null,
          phoneNumber,
          name || cleanUsername,
          passwordHash,
          defaultAvatar,
          bio || '',
          'Comentosh Thinker',
          nowIso
        )
        .run();

      // Create new session token (30 days validity)
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      await env.DB
        .prepare('INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind('sess_' + Date.now(), newUserId, token, expiresAt, nowIso)
        .run();

      const createdUser = await getUserProfile(env.DB, newUserId);
      const headers = createAuthHeaders(token, corsHeaders);

      return jsonResponse({ success: true, user: createdUser, token }, 201, headers);
    }

    // Login (supports Phone Number or Username handle)
    if (path === 'auth/login' && method === 'POST') {
      const body = await parseJsonBody(request);
      const { identifier, password } = body;

      if (!identifier || !password) {
        return jsonResponse({ error: 'Identifier and password are required.' }, 400, corsHeaders);
      }

      const cleanIdentifier = String(identifier).trim();
      const userRow = await env.DB
        .prepare('SELECT * FROM users WHERE phone_number = ? OR username = ? OR email = ?')
        .bind(cleanIdentifier, cleanIdentifier.toLowerCase(), cleanIdentifier)
        .first<UserRow>();

      if (!userRow) {
        return jsonResponse({ error: 'Account not found with this mobile number or username.' }, 404, corsHeaders);
      }

      const isPasswordValid = await verifyPassword(password, userRow.password_hash);
      if (!isPasswordValid) {
        return jsonResponse({ error: 'Incorrect credentials provided.' }, 401, corsHeaders);
      }

      // Create Session
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      await env.DB
        .prepare('INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind('sess_' + Date.now(), userRow.id, token, expiresAt, new Date().toISOString())
        .run();

      const userProfile = await getUserProfile(env.DB, userRow.id);
      const headers = createAuthHeaders(token, corsHeaders);

      return jsonResponse({ success: true, user: userProfile, token }, 200, headers);
    }

    // Logout
    if (path === 'auth/logout' && method === 'POST') {
      if (sessionToken) {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(sessionToken).run();
      }
      const clearHeaders = {
        ...corsHeaders,
        'Set-Cookie': 'session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      };
      return jsonResponse({ success: true, message: 'Logged out successfully.' }, 200, clearHeaders);
    }

    // ----------------------------------------------------
    // 3. POSTS & DISCUSSIONS ENDPOINTS
    // ----------------------------------------------------

    // Get Feed Posts
    if (path === 'posts' && method === 'GET') {
      const topic = url.searchParams.get('topic') || undefined;
      const filter = url.searchParams.get('filter') || undefined;
      const posts = await getFeedPosts(env.DB, currentUser?.id, topic, filter);
      return jsonResponse({ posts }, 200, corsHeaders);
    }

    // Create New Discussion Post
    if (path === 'posts' && method === 'POST') {
      if (!currentUser) {
        return jsonResponse({ error: 'Authentication required to start a discussion.' }, 401, corsHeaders);
      }

      const body = await parseJsonBody(request);
      const { content, topic, images } = body;

      if (!content || !content.trim()) {
        return jsonResponse({ error: 'Post content cannot be empty.' }, 400, corsHeaders);
      }

      const newPostId = 'post_' + Date.now();
      const nowIso = new Date().toISOString();
      const imagesJson = images && Array.isArray(images) && images.length ? JSON.stringify(images) : null;

      await env.DB
        .prepare(`
          INSERT INTO posts (id, user_id, content, topic, images, shares_count, views_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
        `)
        .bind(newPostId, currentUser.id, content.trim(), topic || 'General', imagesJson, nowIso, nowIso)
        .run();

      const created = (await getFeedPosts(env.DB, currentUser.id)).find((p) => p.id === newPostId);
      return jsonResponse({ success: true, post: created, id: newPostId }, 201, corsHeaders);
    }

    // Single Post Details & View Increment
    const singlePostMatch = path.match(/^posts\/([a-zA-Z0-9_-]+)$/);
    if (singlePostMatch) {
      const postId = singlePostMatch[1];

      if (method === 'GET') {
        // Increment views
        await env.DB.prepare('UPDATE posts SET views_count = views_count + 1 WHERE id = ?').bind(postId).run();
        const posts = await getFeedPosts(env.DB, currentUser?.id);
        const post = posts.find((p) => p.id === postId);

        if (!post) {
          return jsonResponse({ error: 'Discussion not found.' }, 404, corsHeaders);
        }
        return jsonResponse({ post }, 200, corsHeaders);
      }

      // Edit Post
      if (method === 'PUT') {
        if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);

        const postRow = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first<{ user_id: string }>();
        if (!postRow) return jsonResponse({ error: 'Post not found.' }, 404, corsHeaders);
        if (postRow.user_id !== currentUser.id) {
          return jsonResponse({ error: 'Permission denied: Cannot edit another thinker\'s discussion.' }, 403, corsHeaders);
        }

        const body = await parseJsonBody(request);
        const { content, topic, images } = body;
        const imagesJson = images ? JSON.stringify(images) : null;

        await env.DB
          .prepare('UPDATE posts SET content = ?, topic = ?, images = ?, updated_at = ? WHERE id = ?')
          .bind(content, topic || 'General', imagesJson, new Date().toISOString(), postId)
          .run();

        return jsonResponse({ success: true, message: 'Discussion updated.' }, 200, corsHeaders);
      }

      // Delete Post
      if (method === 'DELETE') {
        if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);

        const postRow = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first<{ user_id: string }>();
        if (!postRow) return jsonResponse({ error: 'Post not found.' }, 404, corsHeaders);
        if (postRow.user_id !== currentUser.id) {
          return jsonResponse({ error: 'Permission denied: Cannot delete another thinker\'s discussion.' }, 403, corsHeaders);
        }

        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
        return jsonResponse({ success: true, message: 'Discussion removed.' }, 200, corsHeaders);
      }
    }

    // Share Post
    const sharePostMatch = path.match(/^posts\/([a-zA-Z0-9_-]+)\/share$/);
    if (sharePostMatch && method === 'POST') {
      const postId = sharePostMatch[1];
      await env.DB.prepare('UPDATE posts SET shares_count = shares_count + 1 WHERE id = ?').bind(postId).run();
      if (currentUser) {
        await env.DB
          .prepare('INSERT INTO shares (id, user_id, post_id, created_at) VALUES (?, ?, ?, ?)')
          .bind('shr_' + Date.now(), currentUser.id, postId, new Date().toISOString())
          .run();
      }
      return jsonResponse({ success: true, message: 'Shared successfully.' }, 200, corsHeaders);
    }

    // Toggle Save Post
    const savePostMatch = path.match(/^posts\/([a-zA-Z0-9_-]+)\/save$/);
    if (savePostMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const postId = savePostMatch[1];

      const existing = await env.DB
        .prepare('SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?')
        .bind(currentUser.id, postId)
        .first<{ id: string }>();

      let saved = false;
      if (existing) {
        await env.DB.prepare('DELETE FROM saved_posts WHERE id = ?').bind(existing.id).run();
        saved = false;
      } else {
        await env.DB
          .prepare('INSERT INTO saved_posts (id, user_id, post_id, created_at) VALUES (?, ?, ?, ?)')
          .bind('save_' + Date.now(), currentUser.id, postId, new Date().toISOString())
          .run();
        saved = true;
      }
      return jsonResponse({ success: true, saved }, 200, corsHeaders);
    }

    // ----------------------------------------------------
    // 4. COMMENTS & PERSPECTIVES ENDPOINTS
    // ----------------------------------------------------

    // Get Comments for Post
    const getCommentsMatch = path.match(/^posts\/([a-zA-Z0-9_-]+)\/comments$/);
    if (getCommentsMatch && method === 'GET') {
      const postId = getCommentsMatch[1];
      const comments = await getPostComments(env.DB, postId, currentUser?.id);
      return jsonResponse({ comments }, 200, corsHeaders);
    }

    // Add Root Comment to Post
    if (getCommentsMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized. Sign in to join the conversation.' }, 401, corsHeaders);
      const postId = getCommentsMatch[1];
      const body = await parseJsonBody(request);
      const { content } = body;

      if (!content || !content.trim()) {
        return jsonResponse({ error: 'Comment perspective cannot be empty.' }, 400, corsHeaders);
      }

      const commentId = 'com_' + Date.now();
      const nowIso = new Date().toISOString();

      await env.DB
        .prepare('INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?, ?)')
        .bind(commentId, postId, currentUser.id, content.trim(), nowIso, nowIso)
        .run();

      // Create notification for post author if different
      const postRow = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first<{ user_id: string }>();
      if (postRow && postRow.user_id !== currentUser.id) {
        await env.DB
          .prepare(`
            INSERT INTO notifications (id, user_id, actor_id, type, target_id, content_snippet, is_read, created_at)
            VALUES (?, ?, ?, 'post_comment', ?, ?, 0, ?)
          `)
          .bind(
            'notif_' + Date.now(),
            postRow.user_id,
            currentUser.id,
            postId,
            content.substring(0, 80),
            nowIso
          )
          .run();
      }

      const comments = await getPostComments(env.DB, postId, currentUser.id);
      const created = comments.find((c) => c.id === commentId);

      return jsonResponse({ success: true, comment: created }, 201, corsHeaders);
    }

    // Add Reply to Comment
    const replyMatch = path.match(/^comments\/([a-zA-Z0-9_-]+)\/replies$/);
    if (replyMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const parentCommentId = replyMatch[1];
      const body = await parseJsonBody(request);
      const { content } = body;

      if (!content || !content.trim()) {
        return jsonResponse({ error: 'Reply cannot be empty.' }, 400, corsHeaders);
      }

      const parentComment = await env.DB
        .prepare('SELECT post_id, user_id FROM comments WHERE id = ?')
        .bind(parentCommentId)
        .first<{ post_id: string; user_id: string }>();

      if (!parentComment) {
        return jsonResponse({ error: 'Parent comment not found.' }, 404, corsHeaders);
      }

      const replyId = 'rep_' + Date.now();
      const nowIso = new Date().toISOString();

      await env.DB
        .prepare('INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(replyId, parentComment.post_id, currentUser.id, parentCommentId, content.trim(), nowIso, nowIso)
        .run();

      // Notify parent comment author
      if (parentComment.user_id !== currentUser.id) {
        await env.DB
          .prepare(`
            INSERT INTO notifications (id, user_id, actor_id, type, target_id, content_snippet, is_read, created_at)
            VALUES (?, ?, ?, 'comment_reply', ?, ?, 0, ?)
          `)
          .bind(
            'notif_' + Date.now(),
            parentComment.user_id,
            currentUser.id,
            parentComment.post_id,
            content.substring(0, 80),
            nowIso
          )
          .run();
      }

      return jsonResponse({ success: true, replyId }, 201, corsHeaders);
    }

    // Edit Comment
    const singleCommentMatch = path.match(/^comments\/([a-zA-Z0-9_-]+)$/);
    if (singleCommentMatch && method === 'PUT') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const commentId = singleCommentMatch[1];

      const cRow = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).first<{ user_id: string }>();
      if (!cRow) return jsonResponse({ error: 'Comment not found.' }, 404, corsHeaders);
      if (cRow.user_id !== currentUser.id) {
        return jsonResponse({ error: 'Permission denied: Cannot edit another thinker\'s comment.' }, 403, corsHeaders);
      }

      const body = await parseJsonBody(request);
      await env.DB
        .prepare('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?')
        .bind(body.content, new Date().toISOString(), commentId)
        .run();

      return jsonResponse({ success: true, message: 'Comment updated.' }, 200, corsHeaders);
    }

    // Delete Comment
    if (singleCommentMatch && method === 'DELETE') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const commentId = singleCommentMatch[1];

      const cRow = await env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).first<{ user_id: string }>();
      if (!cRow) return jsonResponse({ error: 'Comment not found.' }, 404, corsHeaders);
      if (cRow.user_id !== currentUser.id) {
        return jsonResponse({ error: 'Permission denied: Cannot delete another thinker\'s comment.' }, 403, corsHeaders);
      }

      await env.DB.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').bind(commentId, commentId).run();
      return jsonResponse({ success: true, message: 'Comment removed.' }, 200, corsHeaders);
    }

    // Like / Unlike Comment (Upvote)
    const likeCommentMatch = path.match(/^comments\/([a-zA-Z0-9_-]+)\/like$/);
    if (likeCommentMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const commentId = likeCommentMatch[1];

      const existingLike = await env.DB
        .prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?')
        .bind(commentId, currentUser.id)
        .first<{ id: string }>();

      let liked = false;
      if (existingLike) {
        await env.DB.prepare('DELETE FROM comment_likes WHERE id = ?').bind(existingLike.id).run();
        liked = false;
      } else {
        await env.DB
          .prepare('INSERT INTO comment_likes (id, comment_id, user_id, created_at) VALUES (?, ?, ?, ?)')
          .bind('like_' + Date.now(), commentId, currentUser.id, new Date().toISOString())
          .run();
        liked = true;

        // Notify comment author
        const cRow = await env.DB.prepare('SELECT user_id, post_id, content FROM comments WHERE id = ?').bind(commentId).first<{ user_id: string; post_id: string; content: string }>();
        if (cRow && cRow.user_id !== currentUser.id) {
          await env.DB
            .prepare(`
              INSERT INTO notifications (id, user_id, actor_id, type, target_id, content_snippet, is_read, created_at)
              VALUES (?, ?, ?, 'comment_like', ?, ?, 0, ?)
            `)
            .bind(
              'notif_' + Date.now(),
              cRow.user_id,
              currentUser.id,
              cRow.post_id,
              cRow.content.substring(0, 60),
              new Date().toISOString()
            )
            .run();
        }
      }

      const countRes = await env.DB
        .prepare('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?')
        .bind(commentId)
        .first<{ count: number }>();

      return jsonResponse({ success: true, liked, likesCount: countRes?.count || 0 }, 200, corsHeaders);
    }

    // ----------------------------------------------------
    // 5. USERS & PROFILES ENDPOINTS
    // ----------------------------------------------------

    // List All Active Thinkers
    if (path === 'users' && method === 'GET') {
      const users = await getAllUsers(env.DB, currentUser?.id);
      return jsonResponse({ users }, 200, corsHeaders);
    }

    // Update Profile
    if (path === 'users/profile' && method === 'PUT') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const body = await parseJsonBody(request);
      const { name, username, bio, headline, avatar, phoneNumber } = body;

      const cleanUsername = username ? String(username).toLowerCase().replace(/[^a-z0-9_]/g, '') : currentUser.username;

      // Check if username taken by someone else
      if (cleanUsername !== currentUser.username) {
        const check = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(cleanUsername, currentUser.id).first<{ id: string }>();
        if (check) {
          return jsonResponse({ error: 'Username is already taken by another thinker.' }, 409, corsHeaders);
        }
      }

      await env.DB
        .prepare(`
          UPDATE users 
          SET name = ?, username = ?, bio = ?, headline = ?, avatar_url = ?, phone_number = ?
          WHERE id = ?
        `)
        .bind(
          name !== undefined ? name : currentUser.name,
          cleanUsername,
          bio !== undefined ? bio : currentUser.bio,
          headline !== undefined ? headline : currentUser.headline || null,
          avatar !== undefined ? avatar : currentUser.avatar,
          phoneNumber !== undefined ? phoneNumber : currentUser.phoneNumber || null,
          currentUser.id
        )
        .run();

      const updated = await getUserProfile(env.DB, currentUser.id);
      return jsonResponse({ success: true, user: updated }, 200, corsHeaders);
    }

    // Follow / Unfollow User
    const followMatch = path.match(/^users\/([a-zA-Z0-9_-]+)\/follow$/);
    if (followMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const targetUserId = followMatch[1];

      if (targetUserId === currentUser.id) {
        return jsonResponse({ error: 'Cannot follow yourself.' }, 400, corsHeaders);
      }

      const existingFollow = await env.DB
        .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
        .bind(currentUser.id, targetUserId)
        .first<{ id: string }>();

      let following = false;
      if (existingFollow) {
        await env.DB.prepare('DELETE FROM follows WHERE id = ?').bind(existingFollow.id).run();
        following = false;
      } else {
        await env.DB
          .prepare('INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)')
          .bind('flw_' + Date.now(), currentUser.id, targetUserId, new Date().toISOString())
          .run();
        following = true;
      }

      const targetUser = await getUserProfile(env.DB, targetUserId, currentUser.id);
      return jsonResponse({ success: true, following, user: targetUser }, 200, corsHeaders);
    }

    // Get Single Thinker Profile
    const profileMatch = path.match(/^users\/([a-zA-Z0-9_-]+)$/);
    if (profileMatch && method === 'GET') {
      const targetIdOrHandle = profileMatch[1];
      const user = await getUserProfile(env.DB, targetIdOrHandle, currentUser?.id);
      if (!user) return jsonResponse({ error: 'User profile not found.' }, 404, corsHeaders);
      return jsonResponse({ user }, 200, corsHeaders);
    }

    // ----------------------------------------------------
    // 6. NOTIFICATIONS ENDPOINTS
    // ----------------------------------------------------
    if (path === 'notifications' && method === 'GET') {
      if (!currentUser) return jsonResponse({ notifications: [] }, 200, corsHeaders);
      const notifications = await getNotifications(env.DB, currentUser.id);
      return jsonResponse({ notifications }, 200, corsHeaders);
    }

    const readNotificationMatch = path.match(/^notifications\/([a-zA-Z0-9_-]+)\/read$/);
    if (readNotificationMatch && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      const notifId = readNotificationMatch[1];
      await env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').bind(notifId, currentUser.id).run();
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    if (path === 'notifications/read-all' && method === 'POST') {
      if (!currentUser) return jsonResponse({ error: 'Unauthorized.' }, 401, corsHeaders);
      await env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').bind(currentUser.id).run();
      return jsonResponse({ success: true }, 200, corsHeaders);
    }

    // 404 Route Not Found
    return jsonResponse({ error: `Route not found: ${method} /api/${path}` }, 404, corsHeaders);
  } catch (error: any) {
    console.error('API Error:', error);
    return jsonResponse({ error: error?.message || 'Internal server error' }, 500, corsHeaders);
  }
}

// Helpers
function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

async function parseJsonBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function extractSessionToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/session_token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  return null;
}

function createAuthHeaders(token: string, baseHeaders: Record<string, string>): Record<string, string> {
  return {
    ...baseHeaders,
    'Set-Cookie': `session_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`,
  };
}
