const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const productRoutes = require('./routes/productRoutes');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ملفات الموقع
app.use('/api', productRoutes);   // الروابط

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});