// التحقق من حالة تسجيل الدخول
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname;
    
    // إذا كان مسجل دخول
    if (user) {
        // إذا كان في صفحة تسجيل الدخول أو التسجيل، يروح للرئيسية
        if (currentPage.includes('index.html') || currentPage.includes('register.html') || currentPage === '/' || currentPage.endsWith('/')) {
            window.location.href = 'home.html';
        }
        // إذا كان في صفحة أخرى، يبقى فيها
    } 
    // إذا ما كان مسجل دخول
    else {
        // إذا كان في صفحة محمية، يرجعه لتسجيل الدخول
        if (currentPage.includes('home.html') || currentPage.includes('admin.html')) {
            window.location.href = 'index.html';
        }
        // إذا كان في index أو register، يبقى فيها
    }
});

// تسجيل الدخول
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // التوجيه يتم تلقائياً في onAuthStateChanged
                console.log("تم تسجيل الدخول بنجاح");
            })
            .catch((error) => {
                errorDiv.textContent = getErrorMessage(error.code);
            });
    });
}

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
