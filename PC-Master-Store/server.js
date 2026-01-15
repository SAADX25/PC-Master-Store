require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;
const productRoutes = require('./routes/productRoutes');

// إعداد Gemini باستخدام المفتاح من ملف .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 
app.use('/api', productRoutes);

// --- نقطة نهاية الذكاء الاصطناعي (تم التعديل هنا) ---
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { productName } = req.body;
        
        if (!productName) return res.status(400).json({ error: "اسم المنتج مطلوب" });

        // ✅ تم التغيير إلى gemini-pro لأنه الأكثر استقراراً ويعمل مع جميع الحسابات
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

        // تنظيف النص
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonResponse = JSON.parse(text);
        res.json(jsonResponse);

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "فشل الاتصال بـ Gemini" });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});