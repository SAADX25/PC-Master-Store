const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد الصور
const dir = './public/images';
if (!fs.existsSync(dir)){ fs.mkdirSync(dir, { recursive: true }); }

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'public/images/') },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.get('/products', (req, res) => {
  const { category, search } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  let params = [];
  if (category && category !== 'all') { sql += " AND category = ?"; params.push(category); }
  if (search) { sql += " AND (name_ar LIKE ? OR name_en LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(400).json({ "error": err.message });
    res.json({ message: "success", data: rows });
  });
});

// إضافة منتج (مع البيانات الجديدة)
router.post('/products', upload.single('image'), (req, res) => {
  // استقبال البيانات الجديدة هنا
  const { name_ar, name_en, price, description_ar, description_en, category, brand, is_new, quantity, release_date, delivery_status } = req.body;
  
  const imagePath = req.file ? `/images/${req.file.filename}` : '/images/default.jpg';

  const sql = `INSERT INTO products (name_ar, name_en, price, image, description_ar, description_en, category, brand, is_new, quantity, release_date, delivery_status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
      name_ar, name_en, price, imagePath, 
      description_ar, description_en, 
      category, brand, is_new === 'on' || is_new == 1 ? 1 : 0, 
      quantity || 1, 
      release_date || '2025',      // حفظ تاريخ الإصدار
      delivery_status || 'Available' // حفظ حالة التوصيل
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(400).json({ "error": err.message });
    res.json({ "message": "success", "data": { id: this.lastID } });
  });
});

router.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM products WHERE id = ?", id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "deleted", changes: this.changes });
    });
});

module.exports = router;