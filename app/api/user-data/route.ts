import { NextRequest, NextResponse } from 'next/server';
import { readUserFile, writeUserFile, hashPassword, StoredUserAccount } from '@/lib/user-storage';
import { UserFilePayload } from '@/lib/types';

// GET /api/user-data?username=xxx&password=yyy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const password = searchParams.get('password');

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password credentials required' }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const existing = readUserFile(trimmedUsername);

    if (!existing) {
      return NextResponse.json({ error: 'User file not found' }, { status: 404 });
    }

    const passwordHash = hashPassword(password);
    if (existing.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Unauthorized: Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        username: existing.username,
        displayName: existing.displayName,
        targetYear: existing.targetYear,
        targetRankGoal: existing.targetRankGoal,
      },
      data: existing.data,
      lastLogin: existing.lastLogin,
    });
  } catch (error: any) {
    console.error('Fetch user data error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/user-data -> saves/syncs user logs & questions forever to server file
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, records, questions, announcements, targetYear, targetRankGoal, displayName } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required to save data' }, { status: 400 });
    }

    const trimmedUsername = String(username).trim().toLowerCase();
    const passwordHash = hashPassword(password);
    let existing = readUserFile(trimmedUsername);

    if (!existing) {
      // Auto-create user file if it doesn't exist yet with these credentials
      const newPayload: UserFilePayload = {
        username: trimmedUsername,
        displayName: displayName || trimmedUsername,
        records: records || {},
        questions: questions || [],
        announcements: announcements || [],
        targetYear: targetYear || '2026',
        targetRankGoal: targetRankGoal || 'AIR < 500 (IIT Bombay CSE)',
        lastUpdated: new Date().toISOString(),
      };

      const newUser: StoredUserAccount = {
        username: trimmedUsername,
        passwordHash,
        displayName: displayName || trimmedUsername,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        targetYear: targetYear || '2026',
        targetRankGoal: targetRankGoal || 'AIR < 500 (IIT Bombay CSE)',
        data: newPayload,
      };

      writeUserFile(newUser);

      return NextResponse.json({
        success: true,
        message: 'User file created and synced forever',
        lastUpdated: newPayload.lastUpdated,
      });
    }

    if (existing.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Unauthorized: Invalid password' }, { status: 401 });
    }

    // Update existing user file payload
    const updatedPayload: UserFilePayload = {
      username: existing.username,
      displayName: displayName || existing.displayName,
      records: records !== undefined ? records : existing.data.records,
      questions: questions !== undefined ? questions : existing.data.questions,
      announcements: announcements !== undefined ? announcements : existing.data.announcements,
      targetYear: targetYear || existing.targetYear,
      targetRankGoal: targetRankGoal || existing.targetRankGoal,
      lastUpdated: new Date().toISOString(),
    };

    existing.data = updatedPayload;
    if (displayName) existing.displayName = displayName;
    if (targetYear) existing.targetYear = targetYear;
    if (targetRankGoal) existing.targetRankGoal = targetRankGoal;
    existing.lastLogin = new Date().toISOString();

    writeUserFile(existing);

    return NextResponse.json({
      success: true,
      message: `Data saved to user file (${trimmedUsername}.json) successfully`,
      lastUpdated: updatedPayload.lastUpdated,
    });
  } catch (error: any) {
    console.error('Save user data error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
