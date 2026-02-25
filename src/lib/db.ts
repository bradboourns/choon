import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const filePath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'data', 'choon.db');
fs.mkdirSync(path.dirname(filePath), { recursive: true });
const db = new Database(filePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',email_verified INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER UNIQUE NOT NULL,display_name TEXT NOT NULL,bio TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS venues (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,address TEXT NOT NULL,suburb TEXT NOT NULL,city TEXT NOT NULL,state TEXT NOT NULL,postcode TEXT NOT NULL,lat REAL NOT NULL,lng REAL NOT NULL,website TEXT,instagram TEXT,approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS artists (id INTEGER PRIMARY KEY AUTOINCREMENT,display_name TEXT NOT NULL,instagram TEXT,created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS gigs (id INTEGER PRIMARY KEY AUTOINCREMENT,venue_id INTEGER NOT NULL,artist_name TEXT NOT NULL,artist_id INTEGER,date TEXT NOT NULL,start_time TEXT NOT NULL,end_time TEXT,price_type TEXT NOT NULL,ticket_url TEXT,description TEXT,genres TEXT NOT NULL,vibe_tags TEXT NOT NULL,poster_url TEXT,status TEXT NOT NULL DEFAULT 'pending',created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS saved_gigs (user_id INTEGER NOT NULL,gig_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (user_id, gig_id));
CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT,gig_id INTEGER,venue_id INTEGER,reason TEXT NOT NULL,details TEXT,created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,status TEXT NOT NULL DEFAULT 'open');
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
if (!userColumns.some((column) => column.name === 'email_verified')) {
  db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
}

const standardAccounts = [
  { email: 'admin.platform@choon.local', role: 'admin', displayName: 'Platform Admin' },
  { email: 'admin.fan@choon.local', role: 'user', displayName: 'Fan Admin' },
  { email: 'admin.artist@choon.local', role: 'artist', displayName: 'Artist Admin' },
  { email: 'admin.venue@choon.local', role: 'venue_admin', displayName: 'Venue Admin' },
] as const;

const existingUsers = db.prepare('SELECT email, role FROM users ORDER BY email').all() as Array<{ email: string; role: string }>;
const existingSignature = JSON.stringify(existingUsers);
const expectedSignature = JSON.stringify(
  [...standardAccounts]
    .map(({ email, role }) => ({ email, role }))
    .sort((a, b) => a.email.localeCompare(b.email)),
);

if (existingSignature !== expectedSignature) {
  const hash = bcrypt.hashSync('password', 10);
  const tx = db.transaction(() => {
    db.exec('DELETE FROM user_profiles;');
    db.exec('DELETE FROM artists;');
    db.exec('DELETE FROM users;');

    const userInsert = db.prepare('INSERT INTO users (email,password_hash,role,email_verified) VALUES (?,?,?,?)');
    const profileInsert = db.prepare('INSERT INTO user_profiles (user_id,display_name,bio,location) VALUES (?,?,?,?)');
    const artistInsert = db.prepare('INSERT INTO artists (display_name,instagram,created_by_user_id) VALUES (?,?,?)');

    for (const account of standardAccounts) {
      const result = userInsert.run(account.email, hash, account.role, 1);
      const userId = Number(result.lastInsertRowid);
      profileInsert.run(userId, account.displayName, `${account.displayName} account`, 'Gold Coast');
      if (account.role === 'artist') {
        artistInsert.run(account.displayName, 'admin_artist_choon', userId);
      }
    }
  });

  tx();
}

const venueCount = db.prepare('SELECT COUNT(*) count FROM venues').get() as { count: number };
if (venueCount.count === 0) {
  db.exec(`
  INSERT INTO venues (name,address,suburb,city,state,postcode,lat,lng,website,instagram,approved) VALUES
  ('The Tote','71 Johnston St','Collingwood','Melbourne','VIC','3066',-37.7962,144.9783,'https://thetotehotel.com','thetotehotel',1),
  ('Northcote Social Club','301 High St','Northcote','Melbourne','VIC','3070',-37.7695,144.9985,'https://northcotesocialclub.com','northcotesc',1),
  ('Oxford Art Factory','38-46 Oxford St','Darlinghurst','Sydney','NSW','2010',-33.8784,151.2156,'https://oxfordartfactory.com','oxfordartfactory',1);
  `);
}

const gigCount = db.prepare('SELECT COUNT(*) count FROM gigs').get() as { count: number };
if (gigCount.count === 0) {
  const fallbackCreator =
    (db.prepare("SELECT id FROM users WHERE email = 'admin.platform@choon.local'").get() as { id: number } | undefined)?.id || 1;
  db.exec(`
  INSERT INTO gigs (venue_id,artist_name,date,start_time,price_type,ticket_url,description,genres,vibe_tags,status,created_by_user_id,poster_url)
  VALUES
  (1,'Neon Koala','${new Date().toISOString().slice(0,10)}','19:30','Ticketed','https://example.com/tickets','Indie dance with synth hooks.','["Indie","Electronic"]','["Loud","Sweaty"]','approved',${fallbackCreator},'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'),
  (2,'The Yard Dogs','${new Date(Date.now()+86400000).toISOString().slice(0,10)}','20:00','Door',NULL,'Garage rock all night.','["Rock","Garage"]','["Raw","Noisy"]','approved',${fallbackCreator},'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'),
  (3,'Mina Vale','${new Date(Date.now()+2*86400000).toISOString().slice(0,10)}','18:30','Free',NULL,'Soulful sunset set.','["Soul","Pop"]','["Chill","Date night"]','approved',${fallbackCreator},'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200');
  `);
}

export default db;
