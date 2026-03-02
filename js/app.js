const ADMIN_EMAIL = "naseradmmhmd12@gmail.com";
let currentUser = null;
let products = [];

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = user;
    
    // عرض أول حرف من الإيميل في الأفاتار
    const avatar = document.getElementById('userAvatar');
    if(avatar) {
        avatar.textContent = user.email.charAt(0).toUpperCase();
    }
    
    const emailSpan = document.getElementById('userEmail');
    if(emailSpan) {
        emailSpan.textContent = user.email;
    }
    
    if (user.email === ADMIN_EMAIL) {
        const addBtn = document.getElementById('addBtn');
        if(addBtn) addBtn.classList.remove('hidden');
    }
    
    loadProducts();
});

function loadProducts() {
    db.collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            renderProducts();
        });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">لا توجد منتجات حالياً</div>';
        return;
    }
    
    grid.innerHTML = products.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div style="overflow: hidden;">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price} ريال</div>
                ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
                <button class="btn-buy magnetic" onclick="initiatePayment('${product.id}')">
                    شراء الآن
                </button>
            </div>
        </div>
    `).join('');
    
    // إعادة تفعيل تأثير المغناطيسية
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    
    const grid = document.getElementById('productsGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-products">لا توجد نتائج للبحث</div>';
        return;
    }
    
    grid.innerHTML = filtered.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div style="overflow: hidden;">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price} ريال</div>
                ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
                <button class="btn-buy magnetic" onclick="initiatePayment('${product.id}')">
                    شراء الآن
                </button>
            </div>
        </div>
    `).join('');
}

function goToAdmin() {
    window.location.href = 'admin.html';
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
