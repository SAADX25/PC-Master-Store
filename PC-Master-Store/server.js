require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// استيراد مسارات المنتجات (تأكد أن الملف موجود في routes/productRoutes.js)
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 3000;

// إعداد Gemini
// تأكد من وجود GEMINI_API_KEY في ملف .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. إعدادات الميدل وير (Middleware) ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// إعداد الجلسة (Session)
app.use(session({
    secret: process.env.SESSION_SECRET || 'Saad_Secret_Key_123', // مفتاح تشفير الجلسة
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // اجعله true فقط إذا كان الموقع يعمل ببروتوكول HTTPS
}));

// --- 2. وظائف الحماية (Auth Helper) ---

// ميدل وير للحماية: يسمح بالقراءة للجميع، ويسمح بالتعديل للأدمن فقط
function requireAuth(req, res, next) {
    // السماح للجميع برؤية المنتجات (GET request)
    if (req.method === 'GET') {
        return next();
    }
    
    // التحقق من تسجيل الدخول لطلبات التعديل (POST, DELETE, PUT)
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.status(403).json({ error: "غير مصرح لك (Not Authorized) - يجب تسجيل الدخول" });
    }
}

// --- 3. مسارات المصادقة (Auth Routes) ---

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // بيانات الأدمن (يفضل وضعها في .env)
    const ADMIN_USER = process.env.ADMIN_USER || "SAADX";
    const ADMIN_PASS = process.env.ADMIN_PASS || "Saad2009";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isLoggedIn = true;
        req.session.user = username;
        res.json({ success: true, message: "تم الدخول بنجاح" });
    } else {
        res.status(401).json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
});

// تسجيل الخروج
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "فشل تسجيل الخروج" });
        }
        res.json({ success: true, message: "تم تسجيل الخروج" });
    });
});

// --- 4. ربط مسارات المنتجات مع الحماية ---
// أي مسار داخل productRoutes سيمر أولاً عبر requireAuth
app.use('/api', requireAuth, productRoutes);


// --- 5. مسار الذكاء الاصطناعي (AI Route) ---
app.post('/api/ai/generate', async (req, res) => {
    // حماية إضافية: فقط الأدمن يمكنه استخدام الذكاء الاصطناعي لتوليد الوصف
    if (!req.session.isLoggedIn) {
        return res.status(403).json({ error: "يجب تسجيل الدخول لاستخدام الذكاء الاصطناعي" });
    }

    try {
        const { productName } = req.body;
        if (!productName) return res.status(400).json({ error: "اسم المنتج مطلوب" });

        // استخدام الموديل: gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
        أنت خبير في عتاد الكمبيوتر (PC Hardware).
        المنتج هو: "${productName}".
        أعطني رد بصيغة JSON فقط (بدون markdown أو code blocks) يحتوي على:
        {
            "ar": "وصف تسويقي جذاب وتفصيلي للمنتج بالعربية (لا يتجاوز 3 أسطر)",
            "en": "Professional detailed marketing description in English (max 3 lines)"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // تنظيف النص المستلم لضمان أنه JSON صالح
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(text));

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            error: "فشل الاتصال بـ Gemini",
            details: error.message 
        });
    }
});

// --- تشغيل السيرفر ---
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});