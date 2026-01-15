require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
    console.log("--- بدء فحص الاتصال ---");

    // 1. فحص هل المفتاح موجود؟
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ خطأ: لم يتم العثور على المفتاح في ملف .env");
        console.error("تأكد أن اسم الملف هو .env وليس .env.txt");
        return;
    }
    console.log(`✅ تم قراءة المفتاح بنجاح (يبدأ بـ: ${key.substring(0, 5)}...)`);

    // 2. محاولة الاتصال بجوجل
    console.log("🔄 جاري الاتصال بجوجل لجلب الموديلات...");
    
    try {
        const genAI = new GoogleGenerativeAI(key);
        // سنحاول استخدام الموديل الأحدث أولاً
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = "Hi, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log("✅ نجح الاتصال! الرد من الذكاء الاصطناعي:");
        console.log(text);
        console.log("-----------------------------------------");
        console.log("🎉 الحل: المشكلة كانت في الكود القديم، ومفتاحك يعمل بامتياز مع gemini-1.5-flash");

    } catch (error) {
        console.error("❌ فشل الاتصال. تفاصيل الخطأ:");
        console.error(error.message);
        
        if (error.message.includes("404")) {
            console.log("💡 التحليل: الخطأ 404 يعني أن اسم الموديل غير صحيح أو غير متاح لحسابك.");
        } else if (error.message.includes("400") || error.message.includes("key")) {
            console.log("💡 التحليل: المفتاح غير صالح. تأكد من نسخه بشكل صحيح.");
        }
    }
}

testConnection();