const API_URL = '';

let books = [];
let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkAuth();
  // Automatically load overview statistics on load
  loadOverviewData();
});

// ==========================================
// AUTHENTICATION MANAGEMENT
// ==========================================
function checkAuth() {
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) {
    window.location.href = '/login.html';
    return;
  }
  
  const currentUser = JSON.parse(savedUser);
  
  if (currentUser.role !== 'admin') {
    alert('ปฏิเสธการเข้าถึง: หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น');
    window.location.href = '/';
    return;
  }
  
  // Update status bar UI
  const statusBar = document.getElementById('userStatusBar');
  const statusName = document.getElementById('statusUserName');
  const statusRole = document.getElementById('statusUserRole');
  
  if (statusBar) {
    statusName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    statusRole.textContent = 'ผู้ดูแลระบบ';
    statusBar.style.display = 'flex';
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/login.html';
}

// ==========================================
// THEME
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// ==========================================
// ADMIN TABS SWITCHING
// ==========================================
function switchAdminSection(sectionId) {
  // Update sidebar menu items
  const menuItems = document.querySelectorAll('.admin-menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  document.getElementById(`menu-${sectionId}`).classList.add('active');

  // Update content panels
  const sections = document.querySelectorAll('.admin-content-section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(`section-${sectionId}`).classList.add('active');

  // Trigger data loaders
  if (sectionId === 'overview') {
    loadOverviewData();
  } else if (sectionId === 'books') {
    loadBooksData();
  } else if (sectionId === 'orders') {
    loadOrdersData();
  }
}

// ==========================================
// STATS & OVERVIEW DATA LOADER
// ==========================================
async function loadOverviewData() {
  try {
    // Fetch Books
    const booksRes = await fetch(`${API_URL}/api/books`);
    books = await booksRes.json();

    // Fetch Orders
    const ordersRes = await fetch(`${API_URL}/api/orders`);
    orders = await ordersRes.json();

    // Calculate stats
    const totalBooks = books.length;
    const totalOrders = orders.length;
    
    // Total sales (exclude cancelled and pending orders for real sales, or count paid/shipped)
    const totalSales = orders
      .filter(o => ['paid', 'shipped'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Update UI counters
    document.getElementById('statTotalBooks').textContent = totalBooks;
    document.getElementById('statTotalOrders').textContent = totalOrders;
    document.getElementById('statTotalSales').textContent = `${totalSales} ฿`;

    // Render 5 recent orders
    const recentOrdersBody = document.getElementById('recentOrdersTableBody');
    recentOrdersBody.innerHTML = '';
    
    const recentOrders = orders.slice(0, 5);
    
    if (recentOrders.length === 0) {
      recentOrdersBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">ยังไม่มีรายการสั่งซื้อใดๆ ในขณะนี้</td></tr>`;
      return;
    }

    recentOrders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const customerName = order.userDetails 
        ? `${order.userDetails.firstName} ${order.userDetails.lastName}`
        : 'ผู้ใช้ทั่วไป';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="font-family: monospace; font-size: 0.85rem;">${order._id}</strong></td>
        <td>${customerName}</td>
        <td>${date}</td>
        <td style="font-weight:600; color:var(--primary);">${order.totalAmount} ฿</td>
        <td><span class="status-indicator ${order.status}">${order.status}</span></td>
      `;
      recentOrdersBody.appendChild(tr);
    });

  } catch (error) {
    showToast('โหลดข้อมูลสรุปภาพรวมล้มเหลว: ' + error.message, 'error');
  }
}

// ==========================================
// BOOKS CRUD OPERATIONS
// ==========================================
async function loadBooksData() {
  const tableBody = document.getElementById('adminBooksTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_URL}/api/books`);
    books = await res.json();

    tableBody.innerHTML = '';

    if (books.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">ไม่มีรายการหนังสือในระบบคลังสินค้า</td></tr>`;
      return;
    }

    books.forEach(book => {
      const isOutOfStock = book.stock <= 0;
      const tr = document.createElement('tr');
      
      let coverHtml = '';
      if (book.coverUrl) {
        coverHtml = `<img src="${book.coverUrl}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
      }

      let fallbackTheme = 'mind';
      if (book.coverUrl && book.coverUrl.includes('cover_fiction')) fallbackTheme = 'fiction';
      if (book.coverUrl && book.coverUrl.includes('cover_peace')) fallbackTheme = 'peace';
      if (book.coverUrl && book.coverUrl.includes('cover_coffee')) fallbackTheme = 'coffee';
      if (book.coverUrl && book.coverUrl.includes('cover_poetry')) fallbackTheme = 'poetry';

      tr.innerHTML = `
        <td><code style="font-size:0.8rem; font-weight:bold;">${book._id}</code></td>
        <td>
          <div style="position: relative; width: 40px; height: 50px; overflow:hidden; border-radius: 4px;">
            ${coverHtml}
            <div class="custom-cover ${fallbackTheme}" style="display: ${coverHtml ? 'none' : 'flex'}; padding: 2px; height: 100%; border-radius: 4px; font-size: 6px;">
              <div class="custom-cover-title" style="font-size: 5px; margin: 2px 0 0 0; line-height: 1.1; font-weight: normal; text-shadow:none;">${book.title}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${book.title}</div>
          <div style="font-size: 0.75rem; color: var(--primary); text-transform: uppercase;">${book.serieName || '-'} ${book.volume !== 'เล่มเดียวจบ' ? '(' + book.volume + ')' : ''}</div>
        </td>
        <td>${book.author}</td>
        <td><span class="format-badge ${book.format}" style="position:static; padding: 0.15rem 0.5rem; font-size: 0.7rem;">${book.format}</span></td>
        <td style="font-weight:600;">${book.price} ฿</td>
        <td style="font-weight: 500;" class="${isOutOfStock ? 'book-stock out-of-stock' : ''}">${book.stock}</td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon-btn edit" onclick="openBookFormModal('update', '${book._id}')" title="แก้ไขข้อมูลหนังสือ"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-icon-btn delete" onclick="handleDeleteBook('${book._id}')" title="ลบข้อมูลหนังสือ"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    showToast('โหลดข้อมูลหนังสือล้มเหลว: ' + error.message, 'error');
  }
}

function openBookFormModal(type = 'create', bookId = '') {
  const modal = document.getElementById('bookFormModal');
  const title = document.getElementById('bookModalTitle');
  const submitTypeField = document.getElementById('formSubmitType');
  const idField = document.getElementById('bookIdField');
  
  if (!modal) return;

  submitTypeField.value = type;
  document.getElementById('bookForm').reset();

  if (type === 'create') {
    title.textContent = 'เพิ่มข้อมูลหนังสือใหม่';
    idField.removeAttribute('readonly');
    idField.style.opacity = '1';
    idField.style.cursor = 'text';
    
    // Auto populate next ID
    const nextNum = books.length > 0 
      ? Math.max(...books.map(b => parseInt(b._id.replace('book', '')) || 0)) + 1 
      : 1;
    idField.value = `book${String(nextNum).padStart(4, '0')}`;
  } else {
    title.textContent = 'แก้ไขข้อมูลหนังสือ';
    idField.setAttribute('readonly', 'true');
    idField.style.opacity = '0.7';
    idField.style.cursor = 'not-allowed';

    // Load book details into fields
    const book = books.find(b => b._id === bookId);
    if (book) {
      idField.value = book._id;
      document.getElementById('bookTitleField').value = book.title;
      document.getElementById('bookAuthorField').value = book.author;
      document.getElementById('bookFormatField').value = book.format;
      document.getElementById('bookPriceField').value = book.price;
      document.getElementById('bookSerieField').value = book.serieName || '';
      document.getElementById('bookVolumeField').value = book.volume || '';
      document.getElementById('bookStockField').value = book.stock;
      document.getElementById('bookCoverUrlField').value = book.coverUrl || '/img/covers/cover_mind.png';
      document.getElementById('bookSynopsisField').value = book.synopsis;
    }
  }

  modal.classList.add('active');
}

function closeBookFormModal() {
  const modal = document.getElementById('bookFormModal');
  if (modal) modal.classList.remove('active');
}

async function handleSaveBook(event) {
  event.preventDefault();
  
  const type = document.getElementById('formSubmitType').value;
  const bookId = document.getElementById('bookIdField').value.trim();

  const bookData = {
    _id: bookId,
    title: document.getElementById('bookTitleField').value.trim(),
    author: document.getElementById('bookAuthorField').value.trim(),
    format: document.getElementById('bookFormatField').value,
    price: parseFloat(document.getElementById('bookPriceField').value),
    stock: parseInt(document.getElementById('bookStockField').value),
    serieName: document.getElementById('bookSerieField').value.trim() || undefined,
    volume: document.getElementById('bookVolumeField').value.trim() || undefined,
    coverUrl: document.getElementById('bookCoverUrlField').value,
    synopsis: document.getElementById('bookSynopsisField').value.trim()
  };

  try {
    let url = `${API_URL}/api/books`;
    let method = 'POST';

    if (type === 'update') {
      url = `${API_URL}/api/books/${bookId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Failed to save book');
    }

    showToast(type === 'create' ? 'เพิ่มข้อมูลหนังสือสำเร็จ!' : 'แก้ไขข้อมูลหนังสือสำเร็จ!', 'success');
    closeBookFormModal();
    loadBooksData(); // Refresh list

  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleDeleteBook(id) {
  const book = books.find(b => b._id === id);
  if (!book) return;

  const confirmed = confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือ "${book.title}" ออกจากฐานข้อมูล?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to delete book');
    }

    showToast('ลบข้อมูลหนังสือออกจากระบบแล้ว', 'success');
    loadBooksData(); // Refresh table
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==========================================
// ORDER OPERATIONS (STATUS CHANGER)
// ==========================================
async function loadOrdersData() {
  const tableBody = document.getElementById('adminOrdersTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_URL}/api/orders`);
    orders = await res.json();

    tableBody.innerHTML = '';

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">ไม่มีรายการคำสั่งซื้อใดๆ ในคลังระบบ</td></tr>`;
      return;
    }

    orders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const customerDetails = order.userDetails
        ? `<div style="font-weight:600;">${order.userDetails.firstName} ${order.userDetails.lastName}</div>
           <div style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-phone"></i> ${order.userDetails.tel}</div>
           <div style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-envelope"></i> ${order.userDetails.email}</div>
           <div style="font-size:0.75rem; color:var(--primary); margin-top:4px; max-width:220px; line-height:1.2; font-weight:500;" title="${order.shippingAddress || 'ไม่ได้ระบุที่อยู่'}"><i class="fa-solid fa-location-dot"></i> ${order.shippingAddress || 'ไม่ได้ระบุที่อยู่'}</div>`
        : 'ผู้ใช้ทั่วไป (ไม่ได้ระบุรายละเอียด)';

      // Gather item descriptions
      let itemsListHtml = '';
      if (order.items && order.items.length > 0) {
        itemsListHtml = order.items.map(item => {
          const bookTitle = item.bookDetails ? item.bookDetails.title : `รหัสหนังสือ: ${item.bookId}`;
          return `<div style="font-size: 0.85rem; margin-bottom: 2px;">
            - ${bookTitle} 
            <span style="color:var(--primary); font-weight:500;">(x${item.quantity})</span>
          </div>`;
        }).join('');
      } else {
        itemsListHtml = '<span style="color:var(--text-muted); font-size:0.8rem;">ไม่มีสินค้าระบุ</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="font-family: monospace; font-size: 0.85rem;">${order._id}</strong></td>
        <td>${date}</td>
        <td>${customerDetails}</td>
        <td>${itemsListHtml}</td>
        <td style="font-weight:600; color:var(--primary);">${order.totalAmount} ฿</td>
        <td><span class="status-indicator ${order.status}">${order.status}</span></td>
        <td>
          <select class="order-actions-select" onchange="handleUpdateOrderStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending (รอชำระเงิน)</option>
            <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid (ชำระเงินแล้ว)</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped (จัดส่งแล้ว)</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled (ยกเลิกแล้ว)</option>
          </select>
        </td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    showToast('โหลดข้อมูลคำสั่งซื้อล้มเหลว: ' + error.message, 'error');
  }
}

async function handleUpdateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Failed to update order status');
    }

    showToast(`อัปเดตสถานะออเดอร์ ${orderId} เป็น ${newStatus} สำเร็จ`, 'success');
    loadOrdersData(); // Reload orders grid

  } catch (error) {
    showToast(error.message, 'error');
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
