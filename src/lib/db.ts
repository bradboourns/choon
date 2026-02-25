import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const filePath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'data', 'choon.db');
fs.mkdirSync(path.dirname(filePath), { recursive: true });
const db = new Database(filePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  time_format TEXT NOT NULL DEFAULT '12h',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  abn TEXT,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  website TEXT,
  instagram TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS venue_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (venue_id, user_id)
);
CREATE TABLE IF NOT EXISTS venue_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requested_by_user_id INTEGER NOT NULL,
  venue_name TEXT NOT NULL,
  abn TEXT,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  website TEXT,
  instagram TEXT,
  notes TEXT,
  provisional_venue_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by_user_id INTEGER,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  instagram TEXT,
  created_by_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS partnerships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  requested_by_user_id INTEGER NOT NULL,
  requested_by_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TEXT,
  UNIQUE (venue_id, artist_id)
);
CREATE TABLE IF NOT EXISTS gigs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  artist_name TEXT NOT NULL,
  artist_id INTEGER,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  price_type TEXT NOT NULL,
  ticket_price REAL,
  ticket_url TEXT,
  description TEXT,
  genres TEXT NOT NULL,
  vibe_tags TEXT NOT NULL,
  poster_url TEXT,
  status TEXT NOT NULL DEFAULT 'approved',
  admin_note TEXT NOT NULL DEFAULT '',
  needs_review INTEGER NOT NULL DEFAULT 1,
  created_by_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS saved_gigs (
  user_id INTEGER NOT NULL,
  gig_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, gig_id)
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gig_id INTEGER,
  venue_id INTEGER,
  reason TEXT NOT NULL,
  details TEXT,
  created_by_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'open'
);
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  login_identifier TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
if (!userColumns.some((column) => column.name === 'email_verified')) {
  db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
}
if (!userColumns.some((column) => column.name === 'username')) {
  db.exec('ALTER TABLE users ADD COLUMN username TEXT');
}
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)');
db.exec("UPDATE users SET username = COALESCE(username, email) WHERE username IS NULL OR username = ''");

const venueColumns = db.prepare('PRAGMA table_info(venues)').all() as Array<{ name: string }>;
if (!venueColumns.some((column) => column.name === 'abn')) {
  db.exec('ALTER TABLE venues ADD COLUMN abn TEXT');
}

const profileColumns = db.prepare('PRAGMA table_info(user_profiles)').all() as Array<{ name: string }>;
if (!profileColumns.some((column) => column.name === 'time_format')) {
  db.exec("ALTER TABLE user_profiles ADD COLUMN time_format TEXT NOT NULL DEFAULT '12h'");
}

const venueRequestColumns = db.prepare('PRAGMA table_info(venue_requests)').all() as Array<{ name: string }>;
if (!venueRequestColumns.some((column) => column.name === 'provisional_venue_id')) {
  db.exec('ALTER TABLE venue_requests ADD COLUMN provisional_venue_id INTEGER');
}

const gigColumns = db.prepare('PRAGMA table_info(gigs)').all() as Array<{ name: string }>;
if (!gigColumns.some((column) => column.name === 'needs_review')) {
  db.exec('ALTER TABLE gigs ADD COLUMN needs_review INTEGER NOT NULL DEFAULT 1');
}
if (!gigColumns.some((column) => column.name === 'ticket_price')) {
  db.exec('ALTER TABLE gigs ADD COLUMN ticket_price REAL');
}

if (!gigColumns.some((column) => column.name === 'admin_note')) {
  db.exec("ALTER TABLE gigs ADD COLUMN admin_note TEXT NOT NULL DEFAULT ''");
}

const standardAccounts = [
  { username: 'admin', email: 'admin@choon.local', role: 'admin', displayName: 'Platform Admin' },
  { username: 'fan', email: 'fan@choon.local', role: 'user', displayName: 'Fan Admin' },
  { username: 'artist', email: 'artist@choon.local', role: 'artist', displayName: 'Artist Admin' },
  { username: 'venue', email: 'venue@choon.local', role: 'venue_admin', displayName: 'Venue Admin' },
  { username: 'bine', email: 'hello@bine.com.au', role: 'venue_admin', displayName: 'Bine Bar and Dining' },
  { username: 'dendevine', email: 'bookings@dendevine.com.au', role: 'venue_admin', displayName: 'Den Devine' },
] as const;

const existingUsers = db.prepare('SELECT username, role FROM users ORDER BY username').all() as Array<{ username: string; role: string }>;
const existingSignature = JSON.stringify(existingUsers);
const expectedSignature = JSON.stringify(
  [...standardAccounts]
    .map(({ username, role }) => ({ username, role }))
    .sort((a, b) => a.username.localeCompare(b.username)),
);

if (existingSignature !== expectedSignature) {
  const hash = bcrypt.hashSync('password', 10);
  const tx = db.transaction(() => {
    db.exec('DELETE FROM venue_memberships;');
    db.exec('DELETE FROM venue_requests;');
    db.exec('DELETE FROM reports;');
    db.exec('DELETE FROM saved_gigs;');
    db.exec('DELETE FROM gigs;');
    db.exec('DELETE FROM venues;');
    db.exec('DELETE FROM artists;');
    db.exec('DELETE FROM user_profiles;');
    db.exec('DELETE FROM users;');

    const userInsert = db.prepare('INSERT INTO users (username,email,password_hash,role,email_verified) VALUES (?,?,?,?,?)');
    const profileInsert = db.prepare('INSERT INTO user_profiles (user_id,display_name,bio,location) VALUES (?,?,?,?)');
    const artistInsert = db.prepare('INSERT INTO artists (display_name,instagram,created_by_user_id) VALUES (?,?,?)');

    for (const account of standardAccounts) {
      const result = userInsert.run(account.username, account.email, hash, account.role, 1);
      const userId = Number(result.lastInsertRowid);
      profileInsert.run(userId, account.displayName, `${account.displayName} account`, 'Gold Coast');
      if (account.role === 'artist') {
        artistInsert.run(account.displayName, 'admin_artist_choon', userId);
      }
    }
  });

  tx();
}

const goldCoastVenues = [
  { name: 'Miami Marketta', abn: '11 111 111 111', address: '23 Hillcrest Parade', suburb: 'Miami', city: 'Gold Coast', state: 'QLD', postcode: '4220', lat: -28.0747, lng: 153.4438, website: 'https://www.miamimarketta.com', instagram: 'miamimarketta' },
  { name: 'Vinnie\'s Dive Bar', abn: '22 222 222 222', address: '44A Nerang St', suburb: 'Southport', city: 'Gold Coast', state: 'QLD', postcode: '4215', lat: -27.9697, lng: 153.4094, website: 'https://vinniesdivebar.com.au', instagram: 'vinniesdive' },
  { name: 'HOTA Outdoor Stage', abn: '33 333 333 333', address: '135 Bundall Rd', suburb: 'Surfers Paradise', city: 'Gold Coast', state: 'QLD', postcode: '4217', lat: -28.0032, lng: 153.4177, website: 'https://hota.com.au', instagram: 'hotagc' },
  { name: 'Bine Bar and Dining', abn: '44 444 444 444', address: '1/28 Chairlift Ave', suburb: 'Mermaid Beach', city: 'Gold Coast', state: 'QLD', postcode: '4218', lat: -28.0446, lng: 153.4344, website: 'https://www.bine.com.au', instagram: 'binebardining' },
  { name: 'Den Devine', abn: '55 555 555 555', address: 'Oracle Blvd', suburb: 'Broadbeach', city: 'Gold Coast', state: 'QLD', postcode: '4218', lat: -28.0307, lng: 153.4295, website: 'https://dendevine.com.au', instagram: 'dendevine' },
] as const;

const existingVenues = db.prepare('SELECT name, city FROM venues ORDER BY name').all() as Array<{ name: string; city: string }>;
const existingVenueSignature = JSON.stringify(existingVenues);
const expectedVenueSignature = JSON.stringify(
  [...goldCoastVenues]
    .map(({ name, city }) => ({ name, city }))
    .sort((a, b) => a.name.localeCompare(b.name)),
);

if (existingVenueSignature !== expectedVenueSignature) {
  const fallbackCreator =
    (db.prepare("SELECT id FROM users WHERE username = 'admin'").get() as { id: number } | undefined)?.id || 1;
  db.exec(`
  DELETE FROM venue_memberships;
  DELETE FROM gigs;
  DELETE FROM venues;
  INSERT INTO venues (name,abn,address,suburb,city,state,postcode,lat,lng,website,instagram,approved) VALUES
  ('Miami Marketta','11 111 111 111','23 Hillcrest Parade','Miami','Gold Coast','QLD','4220',-28.0747,153.4438,'https://www.miamimarketta.com','miamimarketta',1),
  ('Vinnie''s Dive Bar','22 222 222 222','44A Nerang St','Southport','Gold Coast','QLD','4215',-27.9697,153.4094,'https://vinniesdivebar.com.au','vinniesdive',1),
  ('HOTA Outdoor Stage','33 333 333 333','135 Bundall Rd','Surfers Paradise','Gold Coast','QLD','4217',-28.0032,153.4177,'https://hota.com.au','hotagc',1),
  ('Bine Bar and Dining','44 444 444 444','1/28 Chairlift Ave','Mermaid Beach','Gold Coast','QLD','4218',-28.0446,153.4344,'https://www.bine.com.au','binebardining',1),
  ('Den Devine','55 555 555 555','Oracle Blvd','Broadbeach','Gold Coast','QLD','4218',-28.0307,153.4295,'https://dendevine.com.au','dendevine',1);

  INSERT INTO venue_memberships (venue_id,user_id,role,approved)
  SELECT venues.id, ${fallbackCreator}, 'owner', 1 FROM venues;
  `);
}

const venueMasterAccount =
  (db.prepare("SELECT id FROM users WHERE username = 'venue' LIMIT 1").get() as { id: number } | undefined)
  || (db.prepare("SELECT id FROM users WHERE role = 'venue_admin' ORDER BY id LIMIT 1").get() as { id: number } | undefined);
if (venueMasterAccount) {
  db.exec(`
  INSERT OR IGNORE INTO venue_memberships (venue_id,user_id,role,approved)
  SELECT id, ${venueMasterAccount.id}, 'owner', 1 FROM venues WHERE approved=1;
  `);
}


const bineAccount = db.prepare("SELECT id FROM users WHERE username = 'bine' LIMIT 1").get() as { id: number } | undefined;
if (bineAccount) {
  db.prepare(`INSERT OR IGNORE INTO venue_memberships (venue_id,user_id,role,approved)
    SELECT id, ?, 'owner', 1 FROM venues WHERE name='Bine Bar and Dining'`).run(bineAccount.id);
}

const denDevineAccount = db.prepare("SELECT id FROM users WHERE username = 'dendevine' LIMIT 1").get() as { id: number } | undefined;
if (denDevineAccount) {
  db.prepare(`INSERT OR IGNORE INTO venue_memberships (venue_id,user_id,role,approved)
    SELECT id, ?, 'owner', 1 FROM venues WHERE name='Den Devine'`).run(denDevineAccount.id);
}

const gigCount = db.prepare('SELECT COUNT(*) count FROM gigs').get() as { count: number };
if (gigCount.count === 0) {
  const fallbackCreator =
    (db.prepare("SELECT id FROM users WHERE username = 'admin'").get() as { id: number } | undefined)?.id || 1;
  db.exec(`
  INSERT INTO gigs (venue_id,artist_name,date,start_time,price_type,ticket_price,ticket_url,description,genres,vibe_tags,status,needs_review,created_by_user_id,poster_url)
  VALUES
  (1,'Neon Koala','${new Date().toISOString().slice(0,10)}','19:30','Ticketed',32.00,'https://example.com/tickets','Indie dance with synth hooks.','["Indie","Electronic"]','["Loud","Sweaty"]','approved',0,${fallbackCreator},'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'),
  (2,'The Yard Dogs','${new Date(Date.now()+86400000).toISOString().slice(0,10)}','20:00','Door',20.00,NULL,'Garage rock all night.','["Rock","Garage"]','["Raw","Noisy"]','approved',0,${fallbackCreator},'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'),
  (3,'Mina Vale','${new Date(Date.now()+2*86400000).toISOString().slice(0,10)}','18:30','Free',0,NULL,'Soulful sunset set.','["Soul","Pop"]','["Chill","Date night"]','approved',0,${fallbackCreator},'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200');
  `);
}

export default db;
