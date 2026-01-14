const express = require('express');
const router = express.Router();
const db = require('../database'); // استيراد قاعدة البيانات

// رابط جلب المنتجات
router.get('/products', (req, res) => {
  const { category, search } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (category && category !== 'all') {
    sql += " AND category = ?";
    params.push(category);
  }
  if (search) {
  sql += " AND (name_ar LIKE ? OR name_en LIKE ?)";
  params.push(`%${search}%`, `%${search}%`);
}

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(400).json({ "error": err.message });
    res.json({ message: "success", data: rows });
  });
});

module.exports = router;