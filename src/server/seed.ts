// Database Seeding for Cloudflare D1
import { D1Database } from './types';
import { hashPassword } from './crypto';
import { CURRENT_USER, DEMO_USERS, INITIAL_POSTS, INITIAL_COMMENTS } from '../data/initialData';

export async function seedDatabaseIfEmpty(db: D1Database): Promise<void> {
  try {
    const existingUser = await db.prepare('SELECT id FROM users LIMIT 1').first<{ id: string }>();
    if (existingUser) {
      // Database already seeded
      return;
    }

    console.log('[D1 Seed] Seeding initial Comentosh thinkers and discussions...');

    const defaultPasswordHash = await hashPassword('comentosh123');

    // 1. Seed users
    const allInitialUsers = [CURRENT_USER, ...DEMO_USERS.filter((u) => u.id !== CURRENT_USER.id)];
    for (const u of allInitialUsers) {
      await db
        .prepare(`
          INSERT INTO users (id, username, email, phone_number, name, password_hash, avatar_url, bio, headline, is_verified, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          u.id,
          u.username,
          `${u.username}@comentosh.com`,
          u.phoneNumber || '+880 1712-345678',
          u.name,
          defaultPasswordHash,
          u.avatar,
          u.bio,
          u.headline || null,
          u.isVerified ? 1 : 0,
          new Date(Date.now() - 30 * 86400000).toISOString()
        )
        .run();
    }

    // 2. Seed posts
    for (const p of INITIAL_POSTS) {
      await db
        .prepare(`
          INSERT INTO posts (id, user_id, content, topic, images, shares_count, views_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          p.id,
          p.author.id,
          p.content,
          p.topic,
          p.images ? JSON.stringify(p.images) : null,
          p.sharesCount || 0,
          p.viewsCount || 10,
          new Date(Date.now() - 2 * 86400000).toISOString(),
          new Date().toISOString()
        )
        .run();
    }

    // 3. Seed comments and replies
    for (const c of INITIAL_COMMENTS) {
      await db
        .prepare(`
          INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at)
          VALUES (?, ?, ?, NULL, ?, ?, ?)
        `)
        .bind(
          c.id,
          c.postId,
          c.author.id,
          c.content,
          new Date(Date.now() - 86400000).toISOString(),
          new Date().toISOString()
        )
        .run();

      // Seed replies
      if (c.replies && c.replies.length > 0) {
        for (const r of c.replies) {
          await db
            .prepare(`
              INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              r.id,
              c.postId,
              r.author.id,
              c.id,
              r.content,
              new Date(Date.now() - 36000000).toISOString(),
              new Date().toISOString()
            )
            .run();
        }
      }
    }

    console.log('[D1 Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[D1 Seed] Error seeding database:', error);
  }
}
