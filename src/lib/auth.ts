import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from './db';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-choon');

export type SessionUser = { id: number; email: string; role: string };

export async function signIn(email: string, password: string) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
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
  const stmt = db.prepare('INSERT INTO users (email,password_hash,role) VALUES (?,?,?)');
  try { stmt.run(email, hash, role); return true; } catch { return false; }
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
