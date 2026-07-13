// API base URL
const API_URL = ''; // Same origin

// App State
let books = [];
let users = [];
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
let searchTimeout = null;
let currentFormatFilter = '';

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkAuth();
  loadBooks();
  updateCartBadge();
});

// ==========================================
// THEME MANAGEMENT
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
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
  
  updateUserUI(currentUser);
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/login.html';
}

function updateUserUI(user) {
  const badge = document.getElementById('userRoleBadge');
  const adminNavLink = document.getElementById('adminNavLink');
  const recSection = document.getElementById('recommendationsSection');
  
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

  // Toggle Admin Tab visibility
  if (adminNavLink) {
    if (user.role === 'admin') {
      adminNavLink.style.display = 'block';
    } else {
      adminNavLink.style.display = 'none';
    }
  }

  // Toggle Recommendations Section
  if (recSection) {
    if (user.role === 'customer') {
      loadRecommendations(user._id);
    } else {
      recSection.style.display = 'none';
    }
  }
}

async function loadRecommendations(userId) {
  const recSection = document.getElementById('recommendationsSection');
  const badgesSpan = document.getElementById('prefCategoryBadges');
  const recGrid = document.getElementById('recommendedBooksGrid');
  
  if (!recSection || !recGrid || !badgesSpan) return;

  try {
    // 1. Load preferences categories
    const prefRes = await fetch(`${API_URL}/api/users/${userId}/preferences`);
    const prefData = await prefRes.json();
    
    if (!prefData || !prefData.categoryName || prefData.categoryName.length === 0) {
      recSection.style.display = 'none';
      return;
    }
    
    badgesSpan.innerHTML = prefData.categoryName.map(cat => `<span style="background: rgba(201, 138, 65, 0.1); padding: 2px 8px; border-radius: 12px; margin-right: 5px; font-size: 0.8rem; border: 1px solid rgba(201, 138, 65, 0.2);">#${cat}</span>`).join('');
    
    // 2. Load recommended books
    const recRes = await fetch(`${API_URL}/api/books/recommendations/${userId}`);
    const recBooks = await recRes.json();
    
    recGrid.innerHTML = '';
    
    if (recBooks.length === 0) {
      recSection.style.display = 'none';
      return;
    }
    
    recSection.style.display = 'block';
    
    recBooks.forEach(book => {
      const isOutOfStock = book.stock <= 0;
      const card = document.createElement('div');
      card.className = 'book-card';
      
      let coverHtml = '';
      if (book.coverUrl && !book.coverUrl.includes('placeholder')) {
        coverHtml = `<img src="${book.coverUrl}" alt="${book.title}" class="book-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
      }
      
      let fallbackTheme = 'mind';
      if (book.coverUrl && book.coverUrl.includes('cover_fiction')) fallbackTheme = 'fiction';
      if (book.coverUrl && book.coverUrl.includes('cover_peace')) fallbackTheme = 'peace';
      if (book.coverUrl && book.coverUrl.includes('cover_coffee')) fallbackTheme = 'coffee';
      if (book.coverUrl && book.coverUrl.includes('cover_poetry')) fallbackTheme = 'poetry';

      card.innerHTML = `
        <div class="book-cover-container" style="height: 180px;">
          ${coverHtml}
          <div class="custom-cover ${fallbackTheme}" style="display: ${coverHtml ? 'none' : 'flex'}; height: 100%; padding: 0.8rem; font-size: 10px; border-radius: 4px;">
            <span class="custom-cover-format" style="font-size: 0.55rem; padding: 1px 4px;">${book.format.toUpperCase()}</span>
            <div class="custom-cover-title" style="font-size: 0.85rem; margin: 0.4rem 0; line-height: 1.2;">${book.title}</div>
            <div class="custom-cover-author" style="font-size: 0.65rem;">${book.author}</div>
          </div>
          <span class="format-badge ${book.format}" style="font-size: 0.6rem; padding: 0.1rem 0.35rem; top: 5px; right: 5px;">${book.format}</span>
        </div>
        <div class="book-info" style="padding: 0.8rem; flex: 1; display:flex; flex-direction:column;">
          <h3 class="book-title" style="font-size: 0.85rem; height: 2.4rem; -webkit-line-clamp: 2; margin-bottom: 0.2rem;" title="${book.title}">${book.title}</h3>
          <div class="book-meta" style="font-size: 0.8rem; padding-top: 0.4rem; margin-top: auto;">
            <span class="book-price" style="font-size: 0.95rem;">${book.price} ฿</span>
            <span class="book-stock ${isOutOfStock ? 'out-of-stock' : ''}">
              ${isOutOfStock ? 'หมด' : `คลัง: ${book.stock}`}
            </span>
          </div>
        </div>
        <div class="book-actions" style="padding: 0 0.8rem 0.8rem; gap: 0.3rem;">
          <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.5rem;" onclick="viewBookSynopsis('${book._id}')">เรื่องย่อ</button>
          <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.35rem 0.5rem;" onclick="addToCart('${book._id}')" ${isOutOfStock ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      `;
      recGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading recommendations:', error);
    recSection.style.display = 'none';
  }
}

// ==========================================
// BOOKS CATALOG MANAGEMENT
// ==========================================
async function loadBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  try {
    const searchVal = document.getElementById('searchInput').value;
    const query = new URLSearchParams();
    if (searchVal) query.append('search', searchVal);
    if (currentFormatFilter) query.append('format', currentFormatFilter);

    const res = await fetch(`${API_URL}/api/books?${query.toString()}`);
    books = await res.json();

    grid.innerHTML = '';

    if (books.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <p>ไม่พบหนังสือที่คุณค้นหาบนชั้นวาง</p>
        </div>
      `;
      return;
    }

    books.forEach(book => {
      const isOutOfStock = book.stock <= 0;
      const card = document.createElement('div');
      card.className = 'book-card';
      
      // Select appropriate theme cover style based on image url configuration
      let coverHtml = '';
      if (book.coverUrl && !book.coverUrl.includes('placeholder')) {
        coverHtml = `<img src="${book.coverUrl}" alt="${book.title}" class="book-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
      }
      
      // Fallback custom cover gradients
      let fallbackTheme = 'mind';
      if (book.coverUrl && book.coverUrl.includes('cover_fiction')) fallbackTheme = 'fiction';
      if (book.coverUrl && book.coverUrl.includes('cover_peace')) fallbackTheme = 'peace';
      if (book.coverUrl && book.coverUrl.includes('cover_coffee')) fallbackTheme = 'coffee';
      if (book.coverUrl && book.coverUrl.includes('cover_poetry')) fallbackTheme = 'poetry';

      card.innerHTML = `
        <div class="book-cover-container">
          ${coverHtml}
          <div class="custom-cover ${fallbackTheme}" style="display: ${coverHtml ? 'none' : 'flex'}">
            <span class="custom-cover-format">${book.format.toUpperCase()}</span>
            <div class="custom-cover-title">${book.title}</div>
            <div class="custom-cover-author">${book.author}</div>
          </div>
          <span class="format-badge ${book.format}">${book.format}</span>
        </div>
        <div class="book-info">
          <span class="book-series">${book.serieName || 'วรรณกรรมสร้างสรรค์'} ${book.volume !== 'เล่มเดียวจบ' ? '- ' + book.volume : ''}</span>
          <h3 class="book-title" title="${book.title}">${book.title}</h3>
          <span class="book-author">ผู้แต่ง: ${book.author}</span>
          <div class="book-meta">
            <span class="book-price">${book.price} ฿</span>
            <span class="book-stock ${isOutOfStock ? 'out-of-stock' : ''}">
              ${isOutOfStock ? 'สินค้าหมดคลัง' : `เหลือในคลัง: ${book.stock}`}
            </span>
          </div>
        </div>
        <div class="book-actions">
          <button class="btn btn-secondary" onclick="viewBookSynopsis('${book._id}')">เรื่องย่อ</button>
          <button class="btn btn-primary" onclick="addToCart('${book._id}')" ${isOutOfStock ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i> ลงตะกร้า
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--danger);">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>เกิดข้อผิดพลาดในการโหลดชั้นหนังสือ: ${error.message}</p>
      </div>
    `;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadBooks();
  }, 300);
}

function setFormatFilter(format, btnElement) {
  currentFormatFilter = format;
  
  // Set active class on buttons
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  loadBooks();
}

async function viewBookSynopsis(id) {
  const modal = document.getElementById('synopsisModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  try {
    const res = await fetch(`${API_URL}/api/books/${id}`);
    const book = await res.json();

    let coverHtml = '';
    if (book.coverUrl) {
      coverHtml = `<img src="${book.coverUrl}" alt="${book.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
    }

    let fallbackTheme = 'mind';
    if (book.coverUrl && book.coverUrl.includes('cover_fiction')) fallbackTheme = 'fiction';
    if (book.coverUrl && book.coverUrl.includes('cover_peace')) fallbackTheme = 'peace';
    if (book.coverUrl && book.coverUrl.includes('cover_coffee')) fallbackTheme = 'coffee';
    if (book.coverUrl && book.coverUrl.includes('cover_poetry')) fallbackTheme = 'poetry';

    body.innerHTML = `
      <div class="book-details-layout">
        <div class="book-details-cover">
          ${coverHtml}
          <div class="custom-cover ${fallbackTheme}" style="display: ${coverHtml ? 'none' : 'flex'}; height: 100%; padding: 1rem;">
            <span class="custom-cover-format" style="font-size: 0.6rem;">${book.format.toUpperCase()}</span>
            <div class="custom-cover-title" style="font-size: 0.95rem;">${book.title}</div>
            <div class="custom-cover-author" style="font-size: 0.7rem;">${book.author}</div>
          </div>
        </div>
        <div class="book-details-info">
          <h2>${book.title}</h2>
          <p class="meta-item"><strong>ผู้แต่ง:</strong> ${book.author}</p>
          <p class="meta-item"><strong>รูปแบบหนังสือ:</strong> ${book.format}</p>
          <p class="meta-item"><strong>ชุดหนังสือ:</strong> ${book.serieName || '-'} (${book.volume || 'เล่มเดียวจบ'})</p>
          <p class="meta-item"><strong>ราคา:</strong> <span style="color:var(--primary); font-weight:bold; font-size:1.2rem;">${book.price} ฿</span></p>
          <p class="meta-item"><strong>จำนวนที่มีในคลัง:</strong> ${book.stock > 0 ? book.stock + ' เล่ม' : '<span style="color:var(--danger)">สินค้าหมดคลัง</span>'}</p>
          
          <div class="book-details-synopsis">
            <strong>เรื่องย่อ / Synopsis:</strong>
            <p>${book.synopsis}</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="closeBookModal()">ปิดหน้านี้</button>
        <button class="btn btn-primary" onclick="addToCart('${book._id}')" ${book.stock <= 0 ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> ลงตะกร้า</button>
      </div>
    `;

    modal.classList.add('active');
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการโหลดเรื่องย่อ: ' + error.message, 'error');
  }
}

function closeBookModal() {
  const modal = document.getElementById('synopsisModal');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// CART OPERATIONS
// ==========================================
function toggleCartPanel() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
      renderCartItems();
    }
  }
}

function addToCart(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return;

  const existingItem = cart.find(item => item.bookId === bookId);

  if (existingItem) {
    if (existingItem.quantity >= book.stock) {
      showToast(`ขออภัย! ในคลังมีหนังสือ "${book.title}" เพียง ${book.stock} เล่มเท่านั้น`, 'warning');
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({
      bookId: book._id,
      title: book.title,
      price: book.price,
      coverUrl: book.coverUrl,
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`เพิ่ม "${book.title}" ลงตะกร้าเรียบร้อย!`, 'success');
  closeBookModal(); // Close modal if add from inside modal
}

function saveCart() {
  localStorage.setItem('bookstore_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadgeCount');
  if (!badge) return;
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  badge.textContent = count;
}

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const totalText = document.getElementById('cartTotalPrice');
  if (!container || !totalText) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-message">
        <i class="fa-solid fa-cart-arrow-down"></i>
        <p>ตะกร้าสินค้าว่างเปล่า</p>
        <p style="font-size: 0.85rem; margin-top: 5px;">เลือกหนังสือที่คุณชอบใส่ตะกร้าได้เลย!</p>
      </div>
    `;
    totalText.textContent = '0 ฿';
    document.getElementById('proceedCheckoutBtn').style.pointerEvents = 'none';
    document.getElementById('proceedCheckoutBtn').style.opacity = '0.5';
    return;
  }

  document.getElementById('proceedCheckoutBtn').style.pointerEvents = 'auto';
  document.getElementById('proceedCheckoutBtn').style.opacity = '1';

  let totalAmount = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';

    let coverHtml = '';
    if (item.coverUrl) {
      coverHtml = `<img src="${item.coverUrl}" class="cart-item-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
    }

    let fallbackTheme = 'mind';
    if (item.coverUrl && item.coverUrl.includes('cover_fiction')) fallbackTheme = 'fiction';
    if (item.coverUrl && item.coverUrl.includes('cover_peace')) fallbackTheme = 'peace';
    if (item.coverUrl && item.coverUrl.includes('cover_coffee')) fallbackTheme = 'coffee';
    if (item.coverUrl && item.coverUrl.includes('cover_poetry')) fallbackTheme = 'poetry';

    div.innerHTML = `
      <div style="position: relative; width: 60px; height: 80px; overflow:hidden; border-radius: var(--radius-sm);">
        ${coverHtml}
        <div class="custom-cover ${fallbackTheme}" style="display: ${coverHtml ? 'none' : 'flex'}; padding: 4px; border-radius: 4px; font-size: 8px;">
          <div class="custom-cover-title" style="font-size: 7px; margin: 4px 0 0 0; line-height: 1.1; font-weight: normal;">${item.title}</div>
        </div>
      </div>
      <div class="cart-item-details">
        <h4 title="${item.title}">${item.title}</h4>
        <span class="cart-item-price">${item.price} ฿</span>
        <div class="quantity-controller">
          <button class="quantity-btn" onclick="updateCartQty('${item.bookId}', -1)">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateCartQty('${item.bookId}', 1)">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="remove-item-btn" onclick="removeCartItem('${item.bookId}')"><i class="fa-solid fa-trash-can"></i></button>
        <span style="font-size:0.9rem; font-weight:600; color:var(--text);">${itemTotal} ฿</span>
      </div>
    `;
    container.appendChild(div);
  });

  totalText.textContent = `${totalAmount} ฿`;
}

function updateCartQty(bookId, change) {
  const item = cart.find(i => i.bookId === bookId);
  if (!item) return;

  const targetBook = books.find(b => b._id === bookId);
  if (change > 0 && targetBook && item.quantity >= targetBook.stock) {
    showToast(`ขออภัย! ในคลังมีจำกัดเพียง ${targetBook.stock} เล่ม`, 'warning');
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.bookId !== bookId);
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeCartItem(bookId) {
  cart = cart.filter(i => i.bookId !== bookId);
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast('นำสินค้าออกจากตะกร้าแล้ว', 'info');
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

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-in reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
