require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session'); // [جديد] مكتبة الجلسات
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;
const productRoutes = require('./routes/productRoutes');

// إعداد Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 1. [جديد] إعداد الجلسة (Session Config)
app.use(session({
    secret: process.env.SESSION_SECRET || 'Saad_Secret_Key_123', // مفتاح التشفير
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // اجعله true إذا رفعت الموقع على https
}));

// 2. [جديد] مسار تسجيل الدخول (Login API)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // يفضل وضع هذه القيم في ملف .env
    const ADMIN_USER = process.env.ADMIN_USER || "SAADX";
    const ADMIN_PASS = process.env.ADMIN_PASS || "Saad2009";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isLoggedIn = true;
        req.session.user = username;
        res.json({ success: true, message: "تم الدخول بنجاح" });
    } else {
        res.status(401).json({ success: false, message: "خطأ في اسم المستخدم أو كلمة المرور" });
    }
});

// 3. [جديد] مسار تسجيل الخروج
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// 4. [جديد] ميدل وير للحماية (Middleware)
// يسمح للجميع برؤية المنتجات (GET)، ويمنع غير الأدمن من الإضافة والحذف (POST/DELETE)
function requireAuth(req, res, next) {
    if (req.method === 'GET') return next(); // السماح بالقراءة للجميع
    
    if (req.session.isLoggedIn) {
        next(); // السماح للأدمن بالتعديل
    } else {
        res.status(403).json({ error: "غير مصرح لك (Not Authorized)" });
    }
}

// تطبيق الحماية على مسارات المنتجات
app.use('/api', requireAuth, productRoutes);

// --- نقطة نهاية الذكاء الاصطناعي ---
app.post('/api/ai/generate', async (req, res) => {
    // التحقق من أن المستخدم أدمن قبل استخدام الـ AI (اختياري)
    if (!req.session.isLoggedIn) return res.status(403).json({ error: "Unauthorized" });

    try {
        const { productName } = req.body;
        if (!productName) return res.status(400).json({ error: "اسم المنتج مطلوب" });

        // [تعديل] استخدام الموديل الصحيح
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        أنت خبير في عتاد الكمبيوتر (PC Hardware).
        المنتج هو: "${productName}".
        أعطني رد بصيغة JSON فقط (بدون markdown) يحتوي على:
        {
            "ar": "وصف تسويقي جذاب وتفصيلي للمنتج بالعربية (لا يتجاوز 3 أسطر)",
            "en": "Professional detailed marketing description in English (max 3 lines)"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "فشل الاتصال بـ Gemini" });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});