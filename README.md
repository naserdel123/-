# متجري الإلكتروني

موقع متكامل لعرض المنتجات مع بوابة دفع ميسر

## الخطوات المطلوبة للتشغيل:

### 1. إنشاء مشروع Firebase:
- اذهب إلى [Firebase Console](https://console.firebase.google.com)
- أنشئ مشروع جديد
- فعّل Authentication (Email/Password)
- فعّل Firestore Database
- فعّل Storage

### 2. الحصول على بيانات Firebase:
- اذهب إلى إعدادات المشروع > تبويب General
- انسخ config وضعه في `js/firebase-config.js`

### 3. إعداد قواعد Firestore:
