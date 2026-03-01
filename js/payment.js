// مفتاح ميسر العام (Public Key)
const MOYASAR_PUBLIC_KEY = "pk_live_uMadyRRfpzd5PsvGgLBeCHLHbyHs5tH9Z43Ax3g7";
let currentProduct = null;

// بدء عملية الدفع
function initiatePayment(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    document.getElementById('paymentModal').classList.remove('hidden');
    
    // تهيئة نموذج ميسر
    Moyasar.init({
        element: '#paymentForm',
        amount: currentProduct.price * 100, // تحويل للهلالات
        currency: 'SAR',
        description: `شراء: ${currentProduct.name}`,
        publishable_api_key: MOYASAR_PUBLIC_KEY,
        callback_url: window.location.href, // URL للمعالجة بعد الدفع
        methods: ['creditcard', 'applepay', 'stcpay'],
        on_completed: function(payment) {
            handlePaymentSuccess(payment);
        },
        on_failed: function(error) {
            handlePaymentError(error);
        }
    });
}

function closePayment() {
    document.getElementById('paymentModal').classList.add('hidden');
    document.getElementById('paymentForm').innerHTML = '';
}

function handlePaymentSuccess(payment) {
    // حفظ عملية الشراء في قاعدة البيانات
    db.collection('orders').add({
        productId: currentProduct.id,
        productName: currentProduct.name,
        price: currentProduct.price,
        userEmail: currentUser.email,
        paymentId: payment.id,
        status: 'completed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('تمت عملية الشراء بنجاح! شكراً لك');
        closePayment();
    });
}

function handlePaymentError(error) {
    alert('فشلت عملية الدفع: ' + (error.message || 'حاول مرة أخرى'));
    console.error('Payment error:', error);
}
