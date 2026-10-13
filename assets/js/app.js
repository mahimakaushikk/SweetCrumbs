/* ============================================================
   SWEET CRUMBS BAKERY - INTERACTIVE LOGIC (MODERN & RESPONSIVE)
   ============================================================ */

// Cart and state storage
let cart = JSON.parse(localStorage.getItem('sweet_crumbs_cart')) || [
  { id: 'croissant', name: 'Classic Butter Croissant', price: 160, qty: 2, img: 'assets/images/butter-croissant.jpg' },
  { id: 'sourdough', name: 'Rustic Country Sourdough', price: 280, qty: 1, img: 'assets/images/artisan-sourdough.jpg' }
];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCartUI();
  initModals();
  initMenuFilters();
  initContactForm();
  initInstantPrefetch();
});

// Modern Mobile Navigation Dropdown
function initNavbar() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const backdrop = document.getElementById('drawerBackdrop');

  function openMenu() {
    if (navMenu) navMenu.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMenu() {
    if (navMenu) navMenu.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu && navMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close when clicking nav links
  document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when opening order modal from mobile drawer
  document.querySelectorAll('[data-open-order-modal]').forEach(btn => {
    btn.addEventListener('click', closeMenu);
  });
}

// Toast notification helper with clean vector icon
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  const checkIcon = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#48BB78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `;

  toast.innerHTML = `<span class="toast-icon">${checkIcon}</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Update Cart Badge and LocalStorage
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) {
    badge.textContent = totalCount;
  }
  localStorage.setItem('sweet_crumbs_cart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1, img });
  }
  updateCartBadge();
  renderCartModal();
  showToast(`Added "${name}" to your box.`);
}

// Render Cart items in Order Modal
function renderCartModal() {
  const list = document.querySelector('.order-items-list');
  const totalEl = document.querySelector('.modal-total-val');
  if (!list || !totalEl) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--color-text-muted);">
        <div style="margin-bottom: 12px; display: flex; justify-content: center;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-orange)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <p style="font-weight: 700; font-size: 1.05rem; color: var(--color-primary-brown);">Your bakery box is currently empty.</p>
        <p style="font-size: 0.88rem; margin-top: 4px;">Explore our oven-fresh treats and pick your favorites!</p>
      </div>
    `;
    totalEl.textContent = '₹0';
    return;
  }

  let total = 0;
  list.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="order-item-row" data-id="${item.id}">
        <div class="order-item-info">
          <img src="${item.img}" alt="${item.name}" class="order-item-img" onerror="this.src='assets/images/hero-banner.jpg'">
          <div>
            <div class="order-item-title">${item.name}</div>
            <div class="order-item-price">₹${item.price} each</div>
          </div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
          <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = `₹${total}`;
}

// Change Quantity
window.changeQty = function(id, delta) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].qty += delta;
    if (cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  updateCartBadge();
  renderCartModal();
};

// Global Add To Cart handler
window.handleAddToCart = function(btn) {
  const id = btn.getAttribute('data-id');
  const name = btn.getAttribute('data-name');
  const price = parseInt(btn.getAttribute('data-price'), 10);
  const img = btn.getAttribute('data-img');
  addToCart(id, name, price, img);
};

// Initialize Cart UI
function initCartUI() {
  updateCartBadge();
  renderCartModal();

  // Attach Add buttons
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      const img = btn.getAttribute('data-img');
      addToCart(id, name, price, img);
    });
  });
}

// Modal handling
function initModals() {
  const modal = document.getElementById('orderModal');
  const openBtns = document.querySelectorAll('[data-open-order-modal]');
  const closeBtns = document.querySelectorAll('[data-close-modal]');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      renderCartModal();
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Confirm order button
  const confirmBtn = document.getElementById('confirmOrderBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Please add items to your box first.');
        return;
      }
      modal.classList.remove('active');
      showToast('Order placed successfully! We will prepare it fresh for you.');
      cart = [];
      updateCartBadge();
      renderCartModal();
    });
  }
}

// Menu Filtering & Search
function initMenuFilters() {
  const chips = document.querySelectorAll('.chip-btn');
  const searchInput = document.querySelector('.search-input');
  const cards = document.querySelectorAll('.menu-item-card');

  if (!chips.length && !searchInput) return;

  function filterItems() {
    const activeChip = document.querySelector('.chip-btn.active');
    const category = activeChip ? activeChip.getAttribute('data-category') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const cardDesc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';

      const matchesCategory = (category === 'all' || cardCategory === category);
      const matchesSearch = (!query || cardTitle.includes(query) || cardDesc.includes(query));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterItems();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }
}

// Contact Form Submission
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name')?.value || 'Guest';
    showToast(`Thank you, ${name}! Your message has been sent to Sweet Crumbs.`);
    form.reset();
  });
}

// Instant Link Prefetching & Fast Navigation Feedback
function initInstantPrefetch() {
  const pagesToPrefetch = ['index.html', 'menu.html', 'contact.html'];
  const prefetched = new Set();

  function prefetchUrl(url) {
    if (!url || prefetched.has(url) || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) return;
    prefetched.add(url);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  // Prefetch other main pages during idle time
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 250));
  scheduleIdle(() => {
    pagesToPrefetch.forEach(page => {
      const currentPath = window.location.pathname;
      const isCurrent = currentPath.endsWith(page) || (page === 'index.html' && (currentPath.endsWith('/') || currentPath === ''));
      if (!isCurrent) {
        prefetchUrl(page);
      }
    });
  });

  // Touchstart & mouseenter prefetching for instant mobile response
  function onLinkIntent(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      prefetchUrl(href);
    }
  }

  document.addEventListener('mouseover', onLinkIntent, { passive: true });
  document.addEventListener('touchstart', onLinkIntent, { passive: true });

  // Navigation loading feedback
  const progressBar = document.getElementById('pageProgressBar');
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !link.hasAttribute('target')) {
      link.addEventListener('click', () => {
        if (progressBar) {
          progressBar.style.opacity = '1';
          progressBar.style.width = '75%';
        }
      });
    }
  });
}

