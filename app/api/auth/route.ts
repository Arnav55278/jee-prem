import { NextRequest, NextResponse } from 'next/server';
import { readUserFile, writeUserFile, hashPassword, StoredUserAccount } from '@/lib/user-storage';
import { UserFilePayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, displayName, targetYear, targetRankGoal } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const trimmedUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (trimmedUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (cleanPassword.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const passwordHash = hashPassword(cleanPassword);
    const existing = readUserFile(trimmedUsername);

    if (action === 'register') {
      if (existing) {
        return NextResponse.json({ error: 'Username is already taken. Please choose another or login.' }, { status: 409 });
      }

      const initialPayload: UserFilePayload = {
        username: trimmedUsername,
        displayName: displayName?.trim() || trimmedUsername,
        records: {},
        questions: [],
        announcements: [],
        targetYear: targetYear || '2026',
        targetRankGoal: targetRankGoal || 'AIR < 500 (IIT Bombay CSE)',
        lastUpdated: new Date().toISOString(),
      };

      const newUser: StoredUserAccount = {
        username: trimmedUsername,
        passwordHash,
        displayName: displayName?.trim() || trimmedUsername,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        targetYear: targetYear || '2026',
        targetRankGoal: targetRankGoal || 'AIR < 500 (IIT Bombay CSE)',
        data: initialPayload,
      };

      writeUserFile(newUser);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          username: newUser.username,
          displayName: newUser.displayName,
          targetYear: newUser.targetYear,
          targetRankGoal: newUser.targetRankGoal,
        },
        data: newUser.data,
      });
    }

    // Default action: 'login'
    if (!existing) {
      return NextResponse.json({ error: 'Account not found. Please register first or check your username.' }, { status: 404 });
    }

    if (existing.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Incorrect password. Please verify and try again.' }, { status: 401 });
    }

    // Update lastLogin timestamp
    existing.lastLogin = new Date().toISOString();
    writeUserFile(existing);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        username: existing.username,
        displayName: existing.displayName,
        targetYear: existing.targetYear,
        targetRankGoal: existing.targetRankGoal,
      },
      data: existing.data,
    });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
