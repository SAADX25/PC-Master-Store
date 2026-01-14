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
    category TEXT, brand TEXT, is_new INTEGER DEFAULT 0
  )`);

  db.get("SELECT count(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      console.log("Seeding Database with Gaming Products...");
      const stmt = db.prepare("INSERT INTO products (name_ar, name_en, price, image, description_ar, description_en, category, brand, is_new) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      
      // PCs
      stmt.run("تجميعة الملك 4060", "RTX 4060 King", 999, "/images/pc1.jpg", "Intel i5 12400F, 16GB RAM", "Intel i5 12400F, 16GB RAM", "pc", "Nvidia", 1);
      stmt.run("الوحش المدمر 4090", "The Beast 4090", 2800, "/images/pc2.jpg", "Intel i9 14900K, 64GB RAM", "Intel i9 14900K, 64GB RAM", "pc", "Nvidia", 1);

      // Monitors
      stmt.run("شاشة سامسونج جي 5", "Samsung Odyssey G5", 350, "/images/monitor1.jpg", "165Hz Curved", "165Hz Curved", "monitor", "Samsung", 0);

      // Components
      stmt.run("معالج رايزن 7", "AMD Ryzen 7 7800X3D", 350, "/images/cpu1.jpg", "Best for Gaming", "Best for Gaming", "cpu", "AMD", 1);
      stmt.run("رامات كورسير", "Corsair Vengeance", 120, "/images/ram1.jpg", "32GB DDR5 RGB", "32GB DDR5 RGB", "ram", "Corsair", 0);

      stmt.finalize();
    }
  });
});

module.exports = db;