import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserFilePayload } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data', 'users');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
}

export function getUserFilePath(username: string): string {
  ensureDataDir();
  const safeName = sanitizeUsername(username);
  return path.join(DATA_DIR, `${safeName}.json`);
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

export interface StoredUserAccount {
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
  targetYear?: string;
  targetRankGoal?: string;
  data: UserFilePayload;
}

export function readUserFile(username: string): StoredUserAccount | null {
  const filePath = getUserFilePath(username);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse user file for ${username}:`, err);
    return null;
  }
}

export function writeUserFile(user: StoredUserAccount): void {
  const filePath = getUserFilePath(user.username);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2), 'utf-8');
}
