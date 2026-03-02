const MOYASAR_PUBLIC_KEY = "pk_live_uMadyRRfpzd5PsvGgLBeCHLHbyHs5tH9Z43Ax3g7";
let currentProduct = null;

function initiatePayment(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    
    Moyasar.init({
        element: '#paymentForm',
        amount: currentProduct.price * 100,
        currency: 'SAR',
        description: `شراء: ${currentProduct.name}`,
        publishable_api_key: MOYASAR_PUBLIC_KEY,
        callback_url: window.location.href,
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
    db.collection('orders').add({
        productId: currentProduct.id,
        productName: currentProduct.name,
        price: currentProduct.price,
        userEmail: currentUser.email,
        paymentId: payment.id,
        status: 'completed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showToast('تمت عملية الشراء بنجاح! شكراً لك', 'success');
        closePayment();
    });
}

function handlePaymentError(error) {
    showToast('فشلت عملية الدفع: ' + (error.message || 'حاول مرة أخرى'), 'error');
    console.error('Payment error:', error);
}
