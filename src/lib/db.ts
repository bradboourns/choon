import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const filePath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'data', 'choon.db');
fs.mkdirSync(path.dirname(filePath), { recursive: true });
const db = new Database(filePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS venues (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,address TEXT NOT NULL,suburb TEXT NOT NULL,city TEXT NOT NULL,state TEXT NOT NULL,postcode TEXT NOT NULL,lat REAL NOT NULL,lng REAL NOT NULL,website TEXT,instagram TEXT,approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS artists (id INTEGER PRIMARY KEY AUTOINCREMENT,display_name TEXT NOT NULL,instagram TEXT,created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS gigs (id INTEGER PRIMARY KEY AUTOINCREMENT,venue_id INTEGER NOT NULL,artist_name TEXT NOT NULL,artist_id INTEGER,date TEXT NOT NULL,start_time TEXT NOT NULL,end_time TEXT,price_type TEXT NOT NULL,ticket_url TEXT,description TEXT,genres TEXT NOT NULL,vibe_tags TEXT NOT NULL,poster_url TEXT,status TEXT NOT NULL DEFAULT 'pending',created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS saved_gigs (user_id INTEGER NOT NULL,gig_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (user_id, gig_id));
CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT,gig_id INTEGER,venue_id INTEGER,reason TEXT NOT NULL,details TEXT,created_by_user_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,status TEXT NOT NULL DEFAULT 'open');
`);

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
  db.exec(`
  INSERT OR IGNORE INTO users (email,password_hash,role) VALUES ('admin@choon.au','$2b$10$Loqe47x7vABm2nyQX1MrQeMFIvFW4L/5M4cQJ3O5kzInAi8u5f0Y2','admin');
  INSERT INTO gigs (venue_id,artist_name,date,start_time,price_type,ticket_url,description,genres,vibe_tags,status,created_by_user_id,poster_url)
  VALUES
  (1,'Neon Koala','${new Date().toISOString().slice(0,10)}','19:30','Ticketed','https://example.com/tickets','Indie dance with synth hooks.','["Indie","Electronic"]','["Loud","Sweaty"]','approved',1,'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'),
  (2,'The Yard Dogs','${new Date(Date.now()+86400000).toISOString().slice(0,10)}','20:00','Door',NULL,'Garage rock all night.','["Rock","Garage"]','["Raw","Noisy"]','approved',1,'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'),
  (3,'Mina Vale','${new Date(Date.now()+2*86400000).toISOString().slice(0,10)}','18:30','Free',NULL,'Soulful sunset set.','["Soul","Pop"]','["Chill","Date night"]','approved',1,'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200');
  `);
}

export default db;
