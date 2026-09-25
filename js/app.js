// LEGACY (EST. 2026) - Main Application Controller (Dedicated Spotlight Category Routing & PKR Default)

const CATEGORY_NAMES = {
  'all': 'All Items',
  'tops': 'Tops & Shirts',
  'pants': 'Pants & Trousers',
  'motorsport': 'Motorsport Streetwear Racing Collection',
  'resort-shirts': 'Monochrome & Resort Vacation Shirts',
  'knit-polos': 'Textured Cable-Knit & Ribbed Polos',
  'gurkha-pants': 'Double-Buckle Gurkha Trousers Collection',
  'airflex-pants': 'Airflex 4-Way Stretch Pants',
  'wideleg-pants': 'Minimalist Double-Pleated Wide-Leg Trousers',
  'denim': 'Japanese Selvedge Denim Collection',
  'shirts': 'Shirts, Shackets & Button-Ups',
  'shorts': 'Cargo Shorts & Pleated Skorts',
  'activewear': 'Activewear, Hoodies & Track Jackets'
};

// State Management
const STATE = {
  currentGender: 'men', // Only MEN, WOMEN, JUNIORS (No ALL)
  currentCategory: 'all',
  currentSort: 'featured', // 'featured' | 'price-low-high' | 'price-high-low' | 'rating'
  cart: JSON.parse(localStorage.getItem('legacy_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('legacy_wishlist') || '[]'),
  activeHeroIndex: 0,
  heroInterval: null,
  currency: 'PKR', // Default currency set to Pakistani Rupees
  currencyRates: {
    PKR: { symbol: 'Rs. ', rate: 1.0 },
    USD: { symbol: '$', rate: 1 / 278.0 },
    GBP: { symbol: '£', rate: 0.79 / 278.0 },
    EUR: { symbol: '€', rate: 0.92 / 278.0 },
    AED: { symbol: 'AED ', rate: 3.67 / 278.0 }
  },
  discountCode: null,
  discountPercent: 0,
  freeShippingThreshold: 3500 // Free shipping in Pakistan on orders over Rs. 3,500
};

// Hero Slides Data (Tailored for MEN, WOMEN, JUNIORS)
const HERO_SLIDES = [
  {
    title: "LEGACY MEN // FW26",
    subtitle: "Atelier Knit Polos & Architectural Tailoring",
    cta: "Shop Men's Collection",
    image: "./images/hero_slide_1.jpg",
    gender: "men",
    category: "all"
  },
  {
    title: "LEGACY WOMEN // FW26",
    subtitle: "Fluid Palazzo Sets & Minimalist Dresses",
    cta: "Explore Women's Drop",
    image: "./images/hero_slide_2.jpg",
    gender: "women",
    category: "all"
  },
  {
    title: "LEGACY JUNIORS // FW26",
    subtitle: "Between Seasons Editorial Archive",
    cta: "Explore Juniors Collection",
    image: "./images/juniors_campaign_ad.png",
    gender: "juniors",
    category: "all"
  }
];

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initGenderNavigation();
  initCategoryFilters();
  initProductGrid();
  initCartDrawer();
  initWishlist();
  initSearch();
  initNavigationDrawer();
  initCurrencySelector();
  initCheckoutFlow();
  lucide.createIcons();
});

// Format Price according to selected currency (base is PKR)
function formatPrice(amountInPKR) {
  const curr = STATE.currencyRates[STATE.currency] || STATE.currencyRates.PKR;
  const converted = Math.round(amountInPKR * curr.rate);
  return `${curr.symbol}${converted.toLocaleString()}`;
}

// ----------------------------------------------------
// 1. Hero Carousel Controller
// ----------------------------------------------------
function initHeroSlider() {
  const container = document.getElementById('heroSlider');
  const dotsContainer = document.getElementById('heroDots');
  if (!container || !dotsContainer) return;

  container.innerHTML = '';
  dotsContainer.innerHTML = '';

  HERO_SLIDES.forEach((slide, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = `hero-slide ${index === 0 ? 'active' : ''}`;
    slideEl.style.backgroundImage = `url('${slide.image}')`;
    slideEl.innerHTML = `
      <div class="hero-slide-overlay">
        <h2 class="hero-caption-title">${slide.title}</h2>
        <p class="hero-caption-sub">${slide.subtitle}</p>
        <button class="hero-cta-btn" onclick="filterBySlide('${slide.gender}', '${slide.category}')">
          <span>${slide.cta}</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    `;
    container.appendChild(slideEl);

    const dot = document.createElement('button');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  startHeroAutoPlay();
}

function startHeroAutoPlay() {
  if (STATE.heroInterval) clearInterval(STATE.heroInterval);
  STATE.heroInterval = setInterval(() => {
    let nextIndex = (STATE.activeHeroIndex + 1) % HERO_SLIDES.length;
    goToSlide(nextIndex);
  }, 5500);
}

function goToSlide(index) {
  STATE.activeHeroIndex = index;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  lucide.createIcons();
  startHeroAutoPlay();
}

function filterBySlide(gender, category) {
  STATE.currentGender = gender;
  setCategory(category);
  const target = document.getElementById('categoriesInFocus');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ----------------------------------------------------
// 2. Gender & Category Filtering
// ----------------------------------------------------
function initGenderNavigation() {
  const genderLinks = document.querySelectorAll('.gender-link, .drawer-gender-tab');
  genderLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetGender = link.getAttribute('data-gender');
      setGender(targetGender);
    });
  });
}

function setGender(gender) {
  if (!['men', 'women', 'juniors'].includes(gender)) {
    gender = 'men';
  }
  STATE.currentGender = gender;
  STATE.currentCategory = 'all';

  document.querySelectorAll('.gender-link').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-gender') === gender);
  });
  document.querySelectorAll('.drawer-gender-tab').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-gender') === gender);
  });

  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
  });

  // Update Section Title & Header
  const titleEl = document.querySelector('.section-title');
  if (titleEl) {
    if (gender === 'men') {
      titleEl.textContent = "Men's Collection";
    } else if (gender === 'women') {
      titleEl.textContent = "Women's Atelier Collection";
    } else if (gender === 'juniors') {
      titleEl.textContent = "Juniors Collection · Between Seasons";
    }
  }

  renderProductGrid();

  // Smooth scroll directly to the collection grid so the user immediately sees the filtered items
  const target = document.getElementById('categoriesInFocus');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Showing: ${gender.toUpperCase()}'S COLLECTION`);
}

function initCategoryFilters() {
  // Category tabs under Categories In Focus
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      setCategory(cat);
    });
  });

  // Spotlight category cards (Clicking ANY card opens its dedicated category view)
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      
      // If currently selected gender has items in this category, keep it; otherwise switch to gender that has it
      const matchingInCurrent = PRODUCTS_DATA.filter(p => 
        p.gender === STATE.currentGender && (p.category === cat || p.subCategory === cat)
      );
      if (matchingInCurrent.length === 0) {
        const found = PRODUCTS_DATA.find(p => p.category === cat || p.subCategory === cat);
        if (found) {
          STATE.currentGender = found.gender;
          document.querySelectorAll('.gender-link, .drawer-gender-tab').forEach(l => 
            l.classList.toggle('active', l.getAttribute('data-gender') === found.gender)
          );
        }
      }

      setCategory(cat);

      // Smooth scroll directly to the items grid
      const target = document.getElementById('categoriesInFocus');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      showToast(`Opened: ${CATEGORY_NAMES[cat] || cat}`);
    });
  });
}

function setCategory(category) {
  STATE.currentCategory = category;

  // Update category tabs active state
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });

  // Update Section Title & Breadcrumb Banner
  const titleEl = document.querySelector('.section-title');
  if (titleEl) {
    let genderPrefix = '';
    if (STATE.currentGender === 'men') genderPrefix = "Men's ";
    if (STATE.currentGender === 'women') genderPrefix = "Women's ";
    if (STATE.currentGender === 'juniors') genderPrefix = "Juniors ";

    if (category === 'all') {
      titleEl.innerHTML = genderPrefix ? `${genderPrefix}Collection` : `Categories In Focus`;
    } else {
      const titleText = CATEGORY_NAMES[category] || category.replace('-', ' ').toUpperCase();
      titleEl.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span>${genderPrefix}${titleText}</span>
          <button onclick="setCategory('all')" style="font-size: 0.72rem; padding: 4px 12px; background: #0c0d0e; color: #fff; border-radius: 4px; font-weight: 700; text-transform: uppercase; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
            <span>✕ View All</span>
          </button>
        </span>
      `;
    }
  }

  renderProductGrid();
}

function setSort(sortType) {
  STATE.currentSort = sortType;

  // Update sort pills active styling
  document.querySelectorAll('.sort-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sort') === sortType);
  });

  renderProductGrid();

  if (sortType === 'price-low-high') {
    showToast('Sorted: Price Low to High');
  } else if (sortType === 'price-high-low') {
    showToast('Sorted: Price High to Low');
  } else if (sortType === 'rating') {
    showToast('Sorted: Highest Rated');
  } else {
    showToast('Sorted: Featured Collection');
  }
}

// ----------------------------------------------------
// 3. Product Grid Rendering
// ----------------------------------------------------
function initProductGrid() {
  renderProductGrid();
}

function renderProductGrid() {
  const gridContainer = document.getElementById('productGrid');
  if (!gridContainer) return;

  // Shallow copy so sorting does not mutate original array
  let products = [...PRODUCTS_DATA];

  // Strict Filter by gender: MEN, WOMEN, or JUNIORS ONLY (No ALL)
  const activeGender = ['men', 'women', 'juniors'].includes(STATE.currentGender) ? STATE.currentGender : 'men';
  STATE.currentGender = activeGender;
  products = products.filter(p => p.gender === activeGender);

  // Filter by category
  if (STATE.currentCategory !== 'all') {
    if (STATE.currentCategory === 'tops') {
      products = products.filter(p => 
        ['knit-polos', 'resort-shirts', 'shirts', 'motorsport', 'tops'].includes(p.category) || 
        p.subCategory === 'shirts' || p.subCategory === 'polos' || p.subCategory === 't-shirts' || p.category === 'tops'
      );
    } else if (STATE.currentCategory === 'pants') {
      products = products.filter(p => 
        ['denim', 'wideleg-pants', 'gurkha-pants', 'airflex-pants', 'pants'].includes(p.category) || 
        p.subCategory === 'trousers' || p.subCategory === 'jeans' || p.subCategory === 'wideleg-pants' || p.category === 'pants'
      );
    } else {
      products = products.filter(p => p.category === STATE.currentCategory || p.subCategory === STATE.currentCategory);
    }
  }

  // Sorting: Low to High, High to Low, Rating, Featured
  if (STATE.currentSort === 'price-low-high') {
    products.sort((a, b) => a.price - b.price);
  } else if (STATE.currentSort === 'price-high-low') {
    products.sort((a, b) => b.price - a.price);
  } else if (STATE.currentSort === 'rating') {
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // Count & Sort Status Update
  const countBadge = document.getElementById('itemCountText');
  const sortInfo = document.getElementById('catalogSortInfo');
  const genderLabel = `${STATE.currentGender.toUpperCase()}'s Collection`;
  const categoryLabel = CATEGORY_NAMES[STATE.currentCategory] || 'Items';

  if (countBadge) {
    countBadge.textContent = `Showing ${products.length} Products in ${genderLabel} (${categoryLabel}) · Cash on Delivery Available Across Pakistan`;
  }

  if (sortInfo) {
    let sortName = 'Featured';
    if (STATE.currentSort === 'price-low-high') sortName = 'Price: Low to High (Lowest First)';
    if (STATE.currentSort === 'price-high-low') sortName = 'Price: High to Low (Luxury First)';
    if (STATE.currentSort === 'rating') sortName = 'Highest Rated';

    sortInfo.innerHTML = `Showing <strong>${products.length} Pieces</strong> · Sorted: <strong>${sortName}</strong>`;
  }

  if (products.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i data-lucide="package-search" style="width: 48px; height: 48px; color: #a0a09e; margin-bottom: 16px;"></i>
        <h3 style="font-family: var(--font-brand); text-transform: uppercase;">No Items Found in this Selection</h3>
        <p style="color: var(--color-gray-mid); font-size: 0.9rem; margin-top: 6px;">Try switching categories or explore the full collection.</p>
        <button class="hero-cta-btn" style="margin-top: 20px;" onclick="setCategory('all');">View Full Collection</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  gridContainer.innerHTML = products.map(product => {
    const isFav = STATE.wishlist.includes(product.id);
    const badgeMarkup = product.badge 
      ? `<span class="product-badge-pill ${product.isAiGenerated ? 'ai-badge' : ''}">${product.badge}</span>` 
      : '';

    return `
      <div class="product-card" data-id="${product.id}" onclick="openProductPage('${product.id}')" style="cursor: pointer;">
        <div class="product-image-container">
          ${badgeMarkup}
          <button class="product-wishlist-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${product.id}', event)">
            <i data-lucide="heart" style="width: 17px; height: 17px; fill: ${isFav ? '#e63946' : 'none'};"></i>
          </button>
          
          <img src="${product.image}" alt="${product.name}" loading="lazy" class="product-image-primary" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'">
          ${product.secondaryImage ? `<img src="${product.secondaryImage}" alt="${product.name}" loading="lazy" class="product-image-secondary">` : ''}

          <div class="product-quick-actions">
            <button class="quick-action-btn" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
              Quick Add
            </button>
            <button class="quick-view-trigger" onclick="event.stopPropagation(); openProductPage('${product.id}')" title="View Full Page">
              <i data-lucide="arrow-up-right" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>

        <div class="product-info">
          <div class="product-meta-row">
            <span class="product-brand-tag">${product.gender.toUpperCase()} · ${product.tag}</span>
            <span class="product-rating">
              <i data-lucide="star" style="width: 12px; height: 12px; fill: #ff9900; stroke: none;"></i>
              ${product.rating}
            </span>
          </div>

          <h3 class="product-name">
            ${product.name}
          </h3>

          <div class="product-price-row">
            <span class="product-current-price">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="product-original-price">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>

          <div class="product-color-swatches">
            ${product.colors.map(c => `<span class="color-swatch-dot" style="background-color: ${c.code};" title="${c.name}"></span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// Direct Navigation to dedicated Product Page
function openProductPage(id) {
  window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

// ----------------------------------------------------
// 4. Cart Operations & Drawer
// ----------------------------------------------------
function initCartDrawer() {
  const openBtn = document.getElementById('openCartBtn');
  const closeBtn = document.getElementById('closeCartBtn');
  const backdrop = document.getElementById('cartBackdrop');
  const drawer = document.getElementById('cartDrawer');

  if (openBtn) openBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);

  const couponBtn = document.getElementById('applyCouponBtn');
  if (couponBtn) {
    couponBtn.addEventListener('click', applyCoupon);
  }

  updateCartUI();
}

function openCart() {
  document.getElementById('cartBackdrop')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cartBackdrop')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
}

function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  const defaultSize = product.sizes[0];
  const defaultColor = product.colors[0].name;
  addToCart(product.id, defaultSize, defaultColor, 1);
}

function addToCart(productId, size, color, qty = 1) {
  const product = getProductById(productId);
  if (!product) return;

  const existingItemIndex = STATE.cart.findIndex(
    item => item.id === productId && item.size === size && item.color === color
  );

  if (existingItemIndex > -1) {
    STATE.cart[existingItemIndex].quantity += qty;
  } else {
    STATE.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      color: color,
      quantity: qty
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added to Bag: ${product.name}`);
  openCart();
}

function updateCartQty(index, change) {
  if (STATE.cart[index]) {
    STATE.cart[index].quantity += change;
    if (STATE.cart[index].quantity <= 0) {
      STATE.cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(index) {
  if (STATE.cart[index]) {
    const item = STATE.cart[index];
    STATE.cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`Removed from Bag: ${item.name}`);
  }
}

function saveCart() {
  localStorage.setItem('legacy_cart', JSON.stringify(STATE.cart));
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartCountBadge');
  const itemsContainer = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');
  const shippingBarEl = document.getElementById('shippingProgressFill');
  const shippingTextEl = document.getElementById('freeShippingText');

  const totalItemCount = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItemCount;

  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * (STATE.discountPercent / 100));
  const finalTotal = subtotal - discount;

  // Free shipping tracker in Pakistan (Rs. 3,500)
  const awayAmount = STATE.freeShippingThreshold - subtotal;
  if (shippingBarEl && shippingTextEl) {
    if (awayAmount <= 0 && subtotal > 0) {
      shippingBarEl.style.width = '100%';
      shippingTextEl.innerHTML = `<strong>MUBARAK!</strong> You unlocked <strong>FREE EXPRESS SHIPPING</strong> across Pakistan!`;
    } else {
      const percentage = Math.min(100, Math.round((subtotal / STATE.freeShippingThreshold) * 100));
      shippingBarEl.style.width = `${percentage}%`;
      shippingTextEl.innerHTML = `Add <strong>${formatPrice(Math.max(0, awayAmount))}</strong> more for <strong>FREE DELIVERY ACROSS PAKISTAN</strong>`;
    }
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (discountEl) discountEl.textContent = `-${formatPrice(discount)}`;
  if (totalEl) totalEl.textContent = formatPrice(finalTotal);

  if (!itemsContainer) return;

  if (STATE.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <i data-lucide="shopping-bag" style="width: 44px; height: 44px; color: #a4a5a7; margin-bottom: 14px;"></i>
        <h4 style="font-family: var(--font-brand); text-transform: uppercase;">Your Bag is Empty</h4>
        <p style="font-size: 0.82rem; color: var(--color-gray-mid); margin: 6px 0 18px;">Discover our trending FW 2026-2027 collection.</p>
        <button class="hero-cta-btn" onclick="closeCart()">Start Shopping</button>
      </div>
    `;
  } else {
    itemsContainer.innerHTML = STATE.cart.map((item, idx) => `
      <div class="cart-item-row">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-specs">Size: <strong>${item.size}</strong> · Color: <strong>${item.color}</strong></span>
          <span style="font-family: var(--font-brand); font-weight: 700; font-size: 0.88rem;">${formatPrice(item.price)}</span>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
            <div class="cart-qty-control">
              <button class="cart-qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            </div>
            <button onclick="removeFromCart(${idx})" style="color: #92959c; font-size: 0.75rem; text-decoration: underline;">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

function applyCoupon() {
  const input = document.getElementById('couponInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'LEGACY2026' || code === 'LEGACY20') {
    STATE.discountCode = code;
    STATE.discountPercent = 20;
    showToast("PROMO APPLIED: 20% OFF!");
    updateCartUI();
  } else if (code === 'FREESHIP') {
    STATE.freeShippingThreshold = 0;
    showToast("PROMO APPLIED: FREE SHIPPING UNLOCKED!");
    updateCartUI();
  } else {
    showToast("Invalid promo code. Try 'LEGACY2026'");
  }
}

// ----------------------------------------------------
// 5. Quick View Modal
// ----------------------------------------------------
let activeQuickViewProduct = null;
let selectedQuickViewSize = null;
let selectedQuickViewColor = null;

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  activeQuickViewProduct = product;
  selectedQuickViewSize = product.sizes[0];
  selectedQuickViewColor = product.colors[0].name;

  const modal = document.getElementById('quickViewModal');
  const content = document.getElementById('quickViewContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="quickview-gallery">
      <div class="quickview-main-image-wrap">
        <img id="qvMainImage" src="${product.image}" alt="${product.name}" style="transition: opacity 0.2s ease;">
        <span class="qv-view-indicator" id="qvViewIndicator">FRONT VIEW</span>
      </div>
      ${product.secondaryImage ? `
        <div class="quickview-thumbnails">
          <button type="button" class="qv-thumb-btn active" onclick="switchQvImage('${product.image}', 'FRONT VIEW', this)">
            <img src="${product.image}" alt="Front View">
            <span>Front View</span>
          </button>
          <button type="button" class="qv-thumb-btn" onclick="switchQvImage('${product.secondaryImage}', 'DETAIL VIEW', this)">
            <img src="${product.secondaryImage}" alt="Detail View">
            <span>Craftsmanship Detail</span>
          </button>
        </div>
      ` : ''}
    </div>

    <div class="quickview-body">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; color: var(--color-gray-mid); text-transform: uppercase;">
          ${product.brand} · ${product.gender.toUpperCase()}
        </span>
        <span class="product-rating">
          <i data-lucide="star" style="width: 14px; height: 14px; fill: #ff9900; stroke: none;"></i>
          ${product.rating} (${product.reviews} reviews)
        </span>
      </div>

      <h2 style="font-family: var(--font-brand); font-size: 1.4rem; text-transform: uppercase; margin-bottom: 10px;">
        ${product.name}
      </h2>

      <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px;">
        <span style="font-family: var(--font-brand); font-size: 1.4rem; font-weight: 800;">
          ${formatPrice(product.price)}
        </span>
        ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--color-gray-mid); font-size: 1rem;">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>

      <p style="font-size: 0.88rem; color: #4b4c52; line-height: 1.6; margin-bottom: 20px;">
        ${product.description}
      </p>

      <!-- Color Selection -->
      <div style="margin-bottom: 18px;">
        <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">
          Color: <span id="qvSelectedColorText" style="font-weight: 500;">${selectedQuickViewColor}</span>
        </span>
        <div style="display: flex; gap: 8px;">
          ${product.colors.map((c, i) => `
            <button class="color-swatch-dot" style="width: 24px; height: 24px; background-color: ${c.code}; cursor: pointer; border: 2px solid ${i === 0 ? 'var(--color-black)' : 'transparent'};" 
              onclick="selectQvColor('${c.name}', this)"></button>
          `).join('')}
        </div>
      </div>

      <!-- Size Selection -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
            Select Size
          </span>
          <span style="font-size: 0.75rem; color: var(--color-gray-mid); text-decoration: underline; cursor: pointer;" onclick="showToast('Size Guide: Standard Relaxed Fit. Select your normal size.')">
            Size Guide
          </span>
        </div>
        <div class="size-selector-chips">
          ${product.sizes.map((s, i) => `
            <button class="size-chip ${i === 0 ? 'selected' : ''}" onclick="selectQvSize('${s}', this)">
              ${s}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Features Checklist -->
      <div style="background-color: var(--color-offwhite); padding: 14px 16px; border-radius: 2px; margin-bottom: 24px;">
        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: block; margin-bottom: 6px;">Garment Specifications:</span>
        <ul style="list-style: none; font-size: 0.78rem; color: #5a5c63; display: flex; flex-direction: column; gap: 4px;">
          ${product.features.map(f => `<li>✓ ${f}</li>`).join('')}
        </ul>
      </div>

      <div style="display: flex; gap: 12px; margin-top: auto;">
        <button class="checkout-btn" style="margin-top: 0; flex: 2;" onclick="addQuickViewToCart()">
          Add to Bag
        </button>
        <button class="hero-cta-btn" style="flex: 1; justify-content: center; background-color: var(--color-offwhite); border: 1px solid var(--color-gray-light);" onclick="toggleWishlist('${product.id}')">
          <i data-lucide="heart" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
      <button class="hero-cta-btn" style="width: 100%; margin-top: 10px; justify-content: center; background: #fff; color: #000; border: 1.5px solid #000; font-size: 0.76rem;" onclick="openProductPage('${product.id}')">
        Open Full Product Page →
      </button>
    </div>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

function selectQvSize(size, btn) {
  selectedQuickViewSize = size;
  document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectQvColor(colorName, btn) {
  selectedQuickViewColor = colorName;
  const label = document.getElementById('qvSelectedColorText');
  if (label) label.textContent = colorName;
  document.querySelectorAll('.color-swatch-dot').forEach(d => d.style.borderColor = 'transparent');
  btn.style.borderColor = 'var(--color-black)';
}

function addQuickViewToCart() {
  if (activeQuickViewProduct && selectedQuickViewSize) {
    addToCart(activeQuickViewProduct.id, selectedQuickViewSize, selectedQuickViewColor, 1);
    closeQuickView();
  }
}

function switchQvImage(imgSrc, label, btn) {
  const mainImg = document.getElementById('qvMainImage');
  const indicator = document.getElementById('qvViewIndicator');
  if (mainImg) {
    mainImg.style.opacity = '0.2';
    setTimeout(() => {
      mainImg.src = imgSrc;
      mainImg.style.opacity = '1';
    }, 120);
  }
  if (indicator && label) {
    indicator.textContent = label;
  }
  document.querySelectorAll('.qv-thumb-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function closeQuickView() {
  document.getElementById('quickViewModal')?.classList.remove('open');
}

// ----------------------------------------------------
// 6. Wishlist Management
// ----------------------------------------------------
function initWishlist() {
  updateWishlistCount();
}

function toggleWishlist(productId, event) {
  if (event) event.stopPropagation();

  const index = STATE.wishlist.indexOf(productId);
  if (index > -1) {
    STATE.wishlist.splice(index, 1);
    showToast("Removed from Wishlist");
  } else {
    STATE.wishlist.push(productId);
    showToast("Saved to Wishlist");
  }

  localStorage.setItem('legacy_wishlist', JSON.stringify(STATE.wishlist));
  updateWishlistCount();
  renderProductGrid();
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlistCountBadge');
  if (badge) badge.textContent = STATE.wishlist.length;
}

// ----------------------------------------------------
// 7. Search Overlay
// ----------------------------------------------------
function initSearch() {
  const triggerBtn = document.getElementById('searchTriggerBtn');
  const closeBtn = document.getElementById('closeSearchBtn');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      overlay?.classList.add('open');
      input?.focus();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
  }

  if (input) {
    input.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  }

  document.querySelectorAll('.trending-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const term = pill.getAttribute('data-tag');
      if (input) {
        input.value = term;
        handleSearch(term);
      }
    });
  });
}

function handleSearch(query) {
  const resultsContainer = document.getElementById('searchResultsList');
  if (!resultsContainer) return;

  if (!query || query.trim().length === 0) {
    resultsContainer.innerHTML = '';
    return;
  }

  const results = searchProducts(query);

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
        <p style="font-size: 0.9rem; color: var(--color-gray-mid);">No matching items found for "${query}"</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = results.map(product => `
    <div class="product-card" onclick="openProductPage('${product.id}'); document.getElementById('searchOverlay').classList.remove('open');" style="cursor: pointer;">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'">
      </div>
      <div class="product-info">
        <span class="product-brand-tag">${product.gender.toUpperCase()}</span>
        <h4 class="product-name" style="font-size: 0.82rem;">${product.name}</h4>
        <span class="product-current-price">${formatPrice(product.price)}</span>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// ----------------------------------------------------
// 8. Navigation Drawer (Matching Reference Image 5)
// ----------------------------------------------------
function initNavigationDrawer() {
  const hamburger = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawer = document.getElementById('navDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      drawer?.classList.add('open');
      backdrop?.classList.add('open');
    });
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-category-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-category');
      closeDrawer();
      setCategory(cat);
      const target = document.getElementById('categoriesInFocus');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ----------------------------------------------------
// 9. Currency Switcher
// ----------------------------------------------------
function initCurrencySelector() {
  const select = document.getElementById('currencySelect');
  if (!select) return;

  select.value = STATE.currency;
  select.addEventListener('change', (e) => {
    STATE.currency = e.target.value;
    renderProductGrid();
    updateCartUI();
    showToast(`Currency updated to ${STATE.currency}`);
  });
}

// ----------------------------------------------------
// 10. Checkout Simulation Flow
// ----------------------------------------------------
function initCheckoutFlow() {
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const modal = document.getElementById('checkoutModal');
  const closeBtn = document.getElementById('closeCheckoutBtn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (STATE.cart.length === 0) {
        showToast("Your bag is currently empty.");
        return;
      }
      closeCart();
      openCheckoutModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal?.classList.remove('open');
    });
  }

  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      processOrder();
    });
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const summaryList = document.getElementById('checkoutOrderSummaryList');
  const totalAmountEl = document.getElementById('checkoutModalTotal');

  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * (STATE.discountPercent / 100));
  const finalTotal = subtotal - discount;

  if (summaryList) {
    summaryList.innerHTML = STATE.cart.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
        <span>${item.quantity}x ${item.name} (${item.size})</span>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `).join('');
  }

  if (totalAmountEl) {
    totalAmountEl.textContent = formatPrice(finalTotal);
  }

  modal?.classList.add('open');
}

function processOrder() {
  const modal = document.getElementById('checkoutModal');
  const orderNum = 'LEG-' + Math.floor(100000 + Math.random() * 900000);

  // Clear cart
  STATE.cart = [];
  saveCart();
  updateCartUI();

  if (modal) {
    modal.innerHTML = `
      <div style="background: #fff; max-width: 520px; width: 100%; padding: 40px 30px; text-align: center; border-radius: 4px; box-shadow: var(--shadow-elevated);">
        <div style="width: 64px; height: 64px; background: #e6f4ea; color: #137333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <i data-lucide="check-circle" style="width: 36px; height: 36px;"></i>
        </div>
        <h2 style="font-family: var(--font-brand); text-transform: uppercase; font-size: 1.5rem; margin-bottom: 10px;">Order Confirmed!</h2>
        <p style="font-size: 0.9rem; color: var(--color-gray-mid); margin-bottom: 16px;">
          Shukriya for choosing <strong>LEGACY BY SHIVAM RANGWANI</strong>.<br>
          WhatsApp / Helpline Support: <strong>03376060956</strong><br>
          Tracking Reference: <strong>#${orderNum}</strong> (Cash on Delivery / Express Courier)
        </p>
        <p style="font-size: 0.8rem; color: #666; margin-bottom: 24px;">
          Your parcel has been dispatched from the Karachi & Lahore Atelier. Expected delivery across Pakistan: 2-3 business days.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="https://wa.me/923376060956?text=Hi%20Shivam%20Rangwani,%20I%20just%20placed%20order%20%23${orderNum}" class="pdp-btn-whatsapp" target="_blank" style="text-decoration: none; padding: 12px 20px;">
            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
            <span>Track on WhatsApp (03376060956)</span>
          </a>
          <button class="hero-cta-btn" onclick="location.reload()">Continue Exploring</button>
        </div>
      </div>
    `;
    lucide.createIcons();
  }
}

// ----------------------------------------------------
// Toast Notification
// ----------------------------------------------------
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `
    <i data-lucide="check" style="width: 16px; height: 16px; stroke-width: 3;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}
