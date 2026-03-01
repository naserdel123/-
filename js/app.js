const ADMIN_EMAIL = "admin@example.com"; // غير هذا لإيميلك
let currentUser = null;
let products = [];

// التحقق من تسجيل الدخول
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = user;
    document.getElementById('userEmail').textContent = user.email;
    
    // إظهار زر الإضافة للأدمن فقط
    if (user.email === ADMIN_EMAIL) {
        document.getElementById('addBtn').classList.remove('hidden');
    }
    
    loadProducts();
});

// تحميل المنتجات
function loadProducts() {
    db.collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            renderProducts();
        }, (error) => {
            console.error("Error loading products:", error);
        });
}

// عرض المنتجات
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">لا توجد منتجات حالياً</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price} ريال</div>
                ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
                <button class="btn-buy" onclick="initiatePayment('${product.id}')">
                    شراء الآن
                </button>
            </div>
        </div>
    `).join('');
}

function goToAdmin() {
    window.location.href = 'admin.html';
}
