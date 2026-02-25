import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from './db';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-choon');

export type SessionUser = { id: number; username: string; role: string };

type RegisterOptions = {
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  homeCity?: string;
};

const adminLoginAliases: Record<string, string> = {
  admin: 'admin',
  fan: 'fan',
  artist: 'artist',
  venue: 'venue',
};

function normalizeLoginIdentifier(value: string) {
  const normalized = value.trim().toLowerCase();
  return adminLoginAliases[normalized] || normalized;
}

export async function signIn(username: string, password: string) {
  const loginIdentifier = normalizeLoginIdentifier(username);
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(loginIdentifier, loginIdentifier) as any;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  const token = await new SignJWT({ id: user.id, username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  (await cookies()).set('choon_session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return user;
}

export async function register(email: string, password: string, role = 'user', options: RegisterOptions = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@')) return false;

  const requestedUsername = (options.username || '').trim().toLowerCase();
  const usernameCandidateBase = requestedUsername || normalizedEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '') || 'member';
  const usernameBase = usernameCandidateBase.slice(0, 24);
  if (!usernameBase) return false;

  const firstName = (options.firstName || '').trim();
  const lastName = (options.lastName || '').trim();
  const dateOfBirth = (options.dateOfBirth || '').trim();
  const homeCity = (options.homeCity || '').trim();

  if (role === 'user') {
    if (!firstName || !lastName || !dateOfBirth || !homeCity) return false;
  }

  const hash = await bcrypt.hash(password, 10);
  const displayName = role === 'user' && firstName && lastName
    ? `${firstName} ${lastName}`
    : usernameBase.replace(/[._-]+/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase());

  const tx = db.transaction(() => {
    if (db.prepare('SELECT id FROM users WHERE username = ?').get(usernameBase)) {
      throw new Error('username-taken');
    }

    const user = db.prepare('INSERT INTO users (username,email,password_hash,role) VALUES (?,?,?,?)').run(usernameBase, normalizedEmail, hash, role);
    db.prepare(`INSERT INTO user_profiles (user_id,display_name,bio,location,first_name,last_name,date_of_birth,home_city)
      VALUES (?,?,?,?,?,?,?,?)`).run(
      Number(user.lastInsertRowid),
      displayName,
      '',
      role === 'user' ? '' : 'Gold Coast',
      firstName,
      lastName,
      dateOfBirth,
      homeCity,
    );
  });

  try { tx(); return true; } catch { return false; }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get('choon_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: Number(payload.id), username: String(payload.username), role: String(payload.role) };
  } catch { return null; }
}

export async function signOut() { (await cookies()).delete('choon_session'); }
