// Cloudflare D1 Database Interfaces and Server Types

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
}

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
}

// Database Rows
export interface UserRow {
  id: string;
  username: string;
  email: string | null;
  phone_number: string | null;
  name: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  is_verified: number;
  created_at: string;
}

export interface PostRow {
  id: string;
  user_id: string;
  content: string;
  topic: string;
  images: string | null;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  target_id: string | null;
  content_snippet: string | null;
  is_read: number;
  created_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
