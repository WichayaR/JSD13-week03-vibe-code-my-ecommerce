const API_URL = '';

let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
let users = [];
let currentUser = null;
let isPaymentDone = false;
let userAddresses = [];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadCartSummary();
  checkAuth();
});

// ==========================================
// THEME
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// ==========================================
// AUTHENTICATION MANAGEMENT
// ==========================================
function checkAuth() {
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) {
    window.location.href = '/login.html';
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  
  // Update status bar UI
  const statusBar = document.getElementById('userStatusBar');
  const statusName = document.getElementById('statusUserName');
  const statusRole = document.getElementById('statusUserRole');
  
  if (statusBar) {
    statusName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    statusRole.textContent = currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า';
    statusBar.style.display = 'flex';
  }
  
  fillUserInfo(currentUser);
  updateUserUI(currentUser);
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/login.html';
}

function fillUserInfo(user) {
  document.getElementById('firstName').value = user.firstName;
  document.getElementById('lastName').value = user.lastName;
  document.getElementById('email').value = user.email;
  document.getElementById('tel').value = user.tel;
  
  // Load addresses from MongoDB (1:N Lookup)
  loadUserAddresses(user._id);
}

async function loadUserAddresses(userId) {
  const select = document.getElementById('shippingAddressSelect');
  const detail = document.getElementById('shippingAddressDetail');
  
  if (!select || !detail) return;

  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/addresses`);
    userAddresses = await res.json();

    select.innerHTML = '';

    if (userAddresses.length === 0) {
      select.innerHTML = '<option value="">ไม่มีที่อยู่บันทึกไว้ในระบบ</option>';
      detail.value = 'ไม่พบที่อยู่จัดส่ง';
      return;
    }

    userAddresses.forEach((addr, idx) => {
      const option = document.createElement('option');
      option.value = addr._id;
      option.textContent = `ที่อยู่จัดส่ง #${idx + 1} (${addr.province})`;
      select.appendChild(option);
    });

    updateSelectedAddressText();
  } catch (error) {
    showToast('โหลดข้อมูลที่อยู่จัดส่งล้มเหลว: ' + error.message, 'error');
  }
}

function updateSelectedAddressText() {
  const select = document.getElementById('shippingAddressSelect');
  const detail = document.getElementById('shippingAddressDetail');
  
  if (!select || !detail || userAddresses.length === 0) return;

  const selectedAddr = userAddresses.find(addr => addr._id === select.value);
  if (selectedAddr) {
    detail.value = `บ้านเลขที่ ${selectedAddr.houseNo} ${selectedAddr.street || ''} ${selectedAddr.subDistrict} ${selectedAddr.district} ${selectedAddr.province} ${selectedAddr.zipCode}`;
  }
}

function updateUserUI(user) {
  const badge = document.getElementById('userRoleBadge');
  const adminNavLink = document.getElementById('adminNavLink');
  
  if (badge) {
    badge.textContent = user.role;
    badge.className = `status-indicator ${user.role === 'admin' ? 'paid' : 'pending'}`;
    if (user.role === 'admin') {
      badge.style.backgroundColor = '#2c3e50';
      badge.style.color = 'white';
    } else {
      badge.style.backgroundColor = '#e8f8f5';
      badge.style.color = '#16a085';
    }
  }

  if (adminNavLink) {
    if (user.role === 'admin') {
      adminNavLink.style.display = 'block';
    } else {
      adminNavLink.style.display = 'none';
    }
  }
}

function loadCartSummary() {
  const container = document.getElementById('checkoutSummaryItems');
  const summaryQty = document.getElementById('checkoutSummaryQty');
  const summaryTotal = document.getElementById('checkoutSummaryTotal');
  const promptPayAmount = document.getElementById('promptPayAmount');

  if (!container || cart.length === 0) {
    // Redirect if cart is empty
    window.location.href = '/';
    return;
  }

  container.innerHTML = '';
  let totalQty = 0;
  let totalAmount = 0;

  cart.forEach(item => {
    totalQty += item.quantity;
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;

    const div = document.createElement('div');
    div.className = 'order-summary-item';
    div.style.marginBottom = '1.2rem';
    div.innerHTML = `
      <div style="flex: 1; padding-right: 1rem;">
        <p style="font-weight: 500; font-size: 0.95rem;">${item.title}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${item.quantity} x ${item.price} ฿</p>
      </div>
      <span style="font-weight: 600;">${itemTotal} ฿</span>
    `;
    container.appendChild(div);
  });

  summaryQty.textContent = `${totalQty} ชิ้น`;
  summaryTotal.textContent = `${totalAmount} ฿`;
  promptPayAmount.textContent = totalAmount;
}

// ==========================================
// PAYMENT SIMULATION
// ==========================================
function selectPaymentMethod(method) {
  // Only PromptPay is active for our simulation
  showToast('ขณะนี้รองรับการจำลองผ่าน PromptPay เท่านั้น', 'info');
}

function simulatePaymentApproval() {
  isPaymentDone = true;
  
  // Update status text
  const statusText = document.getElementById('paymentStatusText');
  statusText.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--success);"></i> ชำระเงินเสร็จสิ้น! (ยอดได้รับการตรวจสอบเรียบร้อย)`;
  statusText.style.color = 'var(--success)';
  statusText.style.fontWeight = 'bold';

  // Enable placing order button
  const submitBtn = document.getElementById('submitOrderBtn');
  submitBtn.removeAttribute('disabled');
  
  showToast('จำลองการสแกนจ่ายเงินสำเร็จ!', 'success');
}

// ==========================================
// ORDER SUBMISSION
// ==========================================
async function handlePlaceOrder(event) {
  event.preventDefault();

  if (!isPaymentDone) {
    showToast('กรุณากดจำลองสแกนจ่ายเงินด้วย PromptPay ก่อนยืนยันคำสั่งซื้อ', 'warning');
    return;
  }

  const submitBtn = document.getElementById('submitOrderBtn');
  submitBtn.setAttribute('disabled', 'true');
  submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังบันทึกออเดอร์เข้า MongoDB...`;

  const orderData = {
    userId: currentUser._id,
    paymentMethod: 'PromptPay',
    shippingAddress: document.getElementById('shippingAddressDetail').value,
    cartItems: cart.map(item => ({
      bookId: item.bookId,
      quantity: item.quantity
    }))
  };

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Failed to submit order');
    }

    // Order Success
    localStorage.removeItem('bookstore_cart'); // Clear cart
    
    // Fill success modal
    document.getElementById('successOrderId').textContent = result.orderId;
    document.getElementById('successCustomerName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('successAmount').textContent = `${result.totalAmount} ฿`;
    
    // Open Modal
    document.getElementById('successModal').classList.add('active');

  } catch (error) {
    showToast(error.message, 'error');
    submitBtn.removeAttribute('disabled');
    submitBtn.textContent = `ยืนยันคำสั่งซื้อ (ชำระเงินก่อน)`;
  }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-in reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
