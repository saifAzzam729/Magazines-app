# 🚀 Quick Start Guide

## اختبار البريد الإلكتروني فقط
```bash
npm run test:email
```

## التشغيل الكامل للمشروع
```bash
# 1. إعداد متغيرات البيئة
cp env.example .env

# 2. تثبيت التبعيات
npm install

# 3. إعداد قاعدة البيانات
npm run prisma:migrate
npm run prisma:seed

# 4. تشغيل الخادم
npm run dev
```

## الوصول للوثائق
- Swagger UI: http://localhost:3000/docs
- Health Check: http://localhost:3000/v1/health

## اختبار البريد الإلكتروني
- يعمل بشكل مستقل بدون قاعدة البيانات
- يستخدم Ethereal Email للاختبار
- يمكن مراجعة الرسائل في: https://ethereal.email/

## البيانات التجريبية
بعد تشغيل `npm run prisma:seed` ستحصل على:
- مستخدم مدير: admin@example.com / password123
- مستخدم ناشر: publisher@example.com / password123  
- مستخدم مشترك: subscriber@example.com / password123
