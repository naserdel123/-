// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXsA8yie6-3dOE7CJfR84LUN5XK_B1kys",
  authDomain: "robloxtrades-9ccc9.firebaseapp.com",
  projectId: "robloxtrades-9ccc9",
  storageBucket: "robloxtrades-9ccc9.firebasestorage.app",
  messagingSenderId: "136195999013",
  appId: "1:136195999013:web:756ffaeb15fa14ba7906cc",
  measurementId: "G-2F7J8TLXSN"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// تصدير الخدمات للاستخدام في الملفات الأخرى
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

console.log("✅ Firebase connected successfully!");
