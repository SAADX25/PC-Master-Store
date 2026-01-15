require('dotenv').config();

async function getAvailableModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return console.log("المفتاح غير موجود!");

    console.log("📡 جاري الاتصال بجوجل لجلب القائمة المسموحة لك...");
    
    // نستخدم رابط API المباشر لنتجاوز أي مشاكل في المكتبة
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("❌ خطأ من جوجل:", data.error.message);
        } else if (data.models) {
            console.log("\n✅ نجحنا! إليك أسماء الموديلات المتاحة لمفتاحك بالضبط:");
            console.log("------------------------------------------------");
            data.models.forEach(m => {
                // نفلتر فقط الموديلات التي تدعم توليد النصوص (generateContent)
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`🌟 الاسم: ${m.name.replace("models/", "")}`);
                }
            });
            console.log("------------------------------------------------");
            console.log("💡 اختر واحداً من الأسماء أعلاه وضعه في server.js");
        } else {
            console.log("⚠️ القائمة فارغة! تأكد أنك فعلت الخدمة في Google Cloud.");
        }
    } catch (error) {
        console.error("فشل الاتصال:", error);
    }
}

getAvailableModels();