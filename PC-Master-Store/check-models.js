require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function diagnoseIssue() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`🔑 المفتاح المستخدم يبدأ بـ: ${key ? key.substring(0, 8) + "..." : "غير موجود!"}`);

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        console.log("📡 جارٍ محاولة الاتصال بـ Google...");
        const result = await model.generateContent("Test");
        console.log("✅ الاتصال نجح! المشكلة ليست في المفتاح.");
    } catch (error) {
        console.log("\n❌ فشل الاتصال. إليك السبب الحقيقي:");
        console.log("------------------------------------------------");
        // طباعة تفاصيل الخطأ كاملة
        if (error.response) {
            console.log(`Error Status: ${error.response.status}`); // رقم الخطأ (مثلاً 400 أو 404)
            console.log(`Error Reason: ${error.response.statusText}`);
        }
        console.log("Full Error Message:", error.message); // رسالة جوجل
        console.log("------------------------------------------------");
    }
}

diagnoseIssue();