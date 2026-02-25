import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from './db';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-choon');

export type SessionUser = { id: number; email: string; role: string };

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

export async function signIn(email: string, password: string) {
  const loginIdentifier = normalizeLoginIdentifier(email);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(loginIdentifier) as any;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  (await cookies()).set('choon_session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return user;
}

export async function register(email: string, password: string, role = 'user') {
  const hash = await bcrypt.hash(password, 10);
  const displayName = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase());
  const tx = db.transaction(() => {
    const user = db.prepare('INSERT INTO users (email,password_hash,role) VALUES (?,?,?)').run(email, hash, role);
    db.prepare('INSERT INTO user_profiles (user_id,display_name,bio,location) VALUES (?,?,?,?)').run(Number(user.lastInsertRowid), displayName, '', 'Gold Coast');
  });
  try { tx(); return true; } catch { return false; }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get('choon_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: Number(payload.id), email: String(payload.email), role: String(payload.role) };
  } catch { return null; }
}

export async function signOut() { (await cookies()).delete('choon_session'); }
