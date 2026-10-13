import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { UserFilePayload } from '@/lib/types';

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

// In-memory persistent cache across warm server instances
const globalStore = globalThis as unknown as {
  __KINETIC_USERS_STORE__?: Map<string, StoredUserAccount>;
  __KINETIC_RESOLVED_DATA_DIR__?: string;
};

if (!globalStore.__KINETIC_USERS_STORE__) {
  globalStore.__KINETIC_USERS_STORE__ = new Map<string, StoredUserAccount>();
}
const memoryStore = globalStore.__KINETIC_USERS_STORE__;

/**
 * Dynamically resolves a guaranteed writable directory for user files.
 * In serverless/container environments (Cloud Run, Vercel, AWS Lambda),
 * `/var/task` is strictly read-only, which causes `mkdir '/var/task/data/users'`
 * to throw ENOENT or EROFS. We gracefully fallback to `os.tmpdir()`.
 */
function resolveWritableDataDir(): string {
  if (globalStore.__KINETIC_RESOLVED_DATA_DIR__) {
    return globalStore.__KINETIC_RESOLVED_DATA_DIR__;
  }

  const candidateDirs: string[] = [];

  // 1. Explicit env override if set
  if (process.env.USER_DATA_DIR) {
    candidateDirs.push(process.env.USER_DATA_DIR);
  }

  // 2. Project local folder (works in local development and standard servers)
  candidateDirs.push(path.join(process.cwd(), 'data', 'users'));

  // 3. System temp folder sub-directory (guaranteed writable in container/serverless environments like Cloud Run)
  candidateDirs.push(path.join(os.tmpdir(), 'kinetic_users'));

  // 4. Raw system temp folder root
  candidateDirs.push(os.tmpdir());

  for (const candidate of candidateDirs) {
    try {
      if (!fs.existsSync(candidate)) {
        fs.mkdirSync(candidate, { recursive: true });
      }

      // Verify that we can actually write a file here
      const testPath = path.join(candidate, `.test_write_${Date.now()}_${Math.random().toString(36).slice(2)}.tmp`);
      fs.writeFileSync(testPath, 'test', 'utf-8');
      if (fs.existsSync(testPath)) {
        fs.unlinkSync(testPath);
      }

      globalStore.__KINETIC_RESOLVED_DATA_DIR__ = candidate;
      return candidate;
    } catch {
      // Continue to next candidate if directory is read-only or not writable
      continue;
    }
  }

  // Fallback to os.tmpdir() directly
  globalStore.__KINETIC_RESOLVED_DATA_DIR__ = os.tmpdir();
  return globalStore.__KINETIC_RESOLVED_DATA_DIR__;
}

function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
}

export function getUserFilePath(username: string): string {
  const dir = resolveWritableDataDir();
  const safeName = sanitizeUsername(username);
  return path.join(dir, `${safeName}.json`);
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

/**
 * Searches across all potential storage locations (memory store, writable dir, local dir, tmp)
 * to retrieve the user's permanent file.
 */
export function readUserFile(username: string): StoredUserAccount | null {
  const cleanUser = sanitizeUsername(username);

  // Check in-memory store first
  if (memoryStore.has(cleanUser)) {
    return memoryStore.get(cleanUser)!;
  }

  // Check possible disk locations
  const searchDirs = [
    resolveWritableDataDir(),
    path.join(process.cwd(), 'data', 'users'),
    path.join(os.tmpdir(), 'kinetic_users'),
    os.tmpdir(),
  ];

  for (const dir of searchDirs) {
    try {
      const filePath = path.join(dir, `${cleanUser}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as StoredUserAccount;
        // Cache into memory store for fast subsequent access
        memoryStore.set(cleanUser, parsed);
        return parsed;
      }
    } catch {
      // Continue checking other locations if read fails
    }
  }

  return null;
}

/**
 * Writes the user account and logs forever to both memory store and disk.
 * If writing to primary disk fails, falls back to /tmp without throwing an unhandled exception.
 */
export function writeUserFile(user: StoredUserAccount): void {
  const cleanUser = sanitizeUsername(user.username);

  // Always keep in-memory store updated
  memoryStore.set(cleanUser, user);

  const payloadString = JSON.stringify(user, null, 2);

  // Try writing to resolved writable directory
  try {
    const primaryPath = getUserFilePath(cleanUser);
    fs.writeFileSync(primaryPath, payloadString, 'utf-8');
    return;
  } catch (err) {
    console.warn(`Primary file write failed for ${cleanUser}, trying fallback to /tmp:`, err);
  }

  // Fallback: write directly to os.tmpdir()
  try {
    const fallbackPath = path.join(os.tmpdir(), `${cleanUser}.json`);
    fs.writeFileSync(fallbackPath, payloadString, 'utf-8');
  } catch (fallbackErr) {
    console.warn(`Fallback file write failed for ${cleanUser}, data retained in memory cache:`, fallbackErr);
  }
}
