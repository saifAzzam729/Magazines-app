# 📮 Postman Collection Guide

## استيراد المجموعة

1. افتح Postman
2. اضغط على "Import" 
3. اختر ملف `docs/postman_collection.json`
4. المجموعة ستظهر في قائمة المجموعات

## 🔧 إعداد المتغيرات

المجموعة تحتوي على المتغيرات التالية:
- `baseUrl`: http://localhost:3000/v1
- `accessToken`: رمز الوصول الحالي
- `refreshToken`: رمز التجديد
- `adminToken`: رمز المدير
- `publisherToken`: رمز الناشر
- `subscriberToken`: رمز المشترك
- `magazineId`: معرف المجلة
- `subscriptionId`: معرف الاشتراك
- `commentId`: معرف التعليق
- `userId`: معرف المستخدم

## 🚀 سيناريو الاختبار الكامل

### 1. تسجيل المستخدمين
- Register Admin User
- Register Publisher User  
- Register Subscriber User

### 2. تسجيل الدخول
- Login Admin (يحفظ adminToken تلقائياً)
- Login Publisher (يحفظ publisherToken تلقائياً)
- Login Subscriber (يحفظ subscriberToken تلقائياً)

### 3. إدارة المجلات
- Create Magazine (Publisher/Admin)
- List All Magazines
- Update Magazine
- Delete Magazine

### 4. إدارة الاشتراكات
- Create Subscription (Subscriber)
- List All Subscriptions (Admin Only)
- Activate Subscription (Publisher/Admin)
- Cancel Subscription

### 5. إدارة التعليقات
- Create Comment (Subscriber)
- List Approved Comments
- List Pending Comments (Admin Only)
- Approve Comment (Admin Only)

### 6. الإدارة
- List All Users (Admin Only)
- Update User Role (Admin Only)
- Get My Permissions
- List Roles & Permissions

## 🧪 اختبار سيناريو كامل

استخدم "Complete Workflow Test" لاختبار تدفق كامل:
1. تسجيل دخول المدير
2. إنشاء مجلة
3. تسجيل دخول المشترك
4. الاشتراك في المجلة
5. إضافة تعليق
6. تسجيل دخول المدير مرة أخرى
7. اعتماد التعليق

## 📧 اختبار البريد الإلكتروني

```bash
npm run test:email
```

## 🔍 نصائح الاستخدام

- جميع الطلبات تحتوي على اختبارات تلقائية لحفظ المتغيرات
- استخدم "Complete Workflow Test" لاختبار سريع
- تحقق من الاستجابات للتأكد من عمل النظام
- راجع سجل الخادم لمراقبة تسجيل الأنشطة
