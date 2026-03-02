// تسجيل الدخول
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
                // نجاح - نروح للرئيسية مباشرة
                window.location.href = 'home.html';
            })
            .catch((error) => {
                errorDiv.textContent = getErrorMessage(error.code);
                btn.disabled = false;
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
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

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}
