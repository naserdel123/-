// التحقق من حالة تسجيل الدخول
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('index.html')) {
        window.location.href = 'home.html';
    }
});

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'home.html';
        })
        .catch((error) => {
            errorDiv.textContent = getErrorMessage(error.code);
        });
});

function getErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/user-disabled': 'الحساب معطل',
        'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
        'auth/wrong-password': 'كلمة المرور غير صحيحة'
    };
    return messages[code] || 'حدث خطأ، حاول مرة أخرى';
}

// تسجيل الخروج
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}
