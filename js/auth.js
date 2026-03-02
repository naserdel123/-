// تسجيل الدخول فقط - بدون إعادة توجيه تلقائية
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');
        const btn = e.target.querySelector('button');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        btn.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // نجاح تسجيل الدخول - نظهر رسالة فقط
                showSuccess('تم تسجيل الدخول بنجاح! ✓');
                btnText.textContent = 'تم الدخول';
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
                
                // تغيير الزر ليصبح "الذهاب للرئيسية"
                setTimeout(() => {
                    btn.onclick = () => window.location.href = 'home.html';
                    btnText.textContent = 'الذهاب للرئيسية →';
                    btn.disabled = false;
                }, 1000);
            })
            .catch((error) => {
                errorDiv.textContent = getErrorMessage(error.code);
                btn.disabled = false;
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
            });
    });
}

// تسجيل الخروج
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
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

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--success)';
    errorDiv.style.background = 'rgba(16,185,129,0.1)';
    errorDiv.style.borderRight = '3px solid var(--success)';
}
