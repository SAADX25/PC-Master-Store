const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./store.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT, name_en TEXT,
    price REAL, image TEXT,
    description_ar TEXT, description_en TEXT,
    category TEXT, brand TEXT, 
    is_new INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    release_date TEXT,          -- تاريخ الإنتاج/الإصدار
    delivery_status TEXT        -- حالة التوصيل
  )`);
});

module.exports = db;