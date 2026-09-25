// LEGACY (EST. 2026) - Product Detail Page Controller (PDP)

const RATES = {
  PKR: { symbol: 'Rs. ', rate: 1 },
  USD: { symbol: '$', rate: 1.0 / 278.0 },
  GBP: { symbol: '£', rate: 0.79 / 278.0 },
  EUR: { symbol: '€', rate: 0.92 / 278.0 },
  AED: { symbol: 'AED ', rate: 3.67 / 278.0 }
};

const PDP_STATE = {
  currency: localStorage.getItem('legacy_currency') || 'PKR',
  cart: JSON.parse(localStorage.getItem('legacy_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('legacy_wishlist') || '[]'),
  product: null,
  selectedColor: '',
  selectedSize: '',
  quantity: 1,
  activeImage: ''
};

function formatPrice(pkr) {
  const curr = RATES[PDP_STATE.currency] || RATES.PKR;
  const converted = Math.round(pkr * curr.rate);
  return `${curr.symbol}${converted.toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
  initCartDrawer();
  initCheckoutFlow();
  initCurrencySelector();
  lucide.createIcons();
});

function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Find product from PRODUCTS_DATA (loaded via products.js)
  PDP_STATE.product = (typeof PRODUCTS_DATA !== 'undefined' && PRODUCTS_DATA.find(p => p.id === productId)) 
    || (typeof PRODUCTS_DATA !== 'undefined' && PRODUCTS_DATA[0]) 
    || null;

  if (!PDP_STATE.product) {
    console.error('Product not found');
    return;
  }

  const p = PDP_STATE.product;
  PDP_STATE.selectedColor = p.colors[0]?.name || 'Standard';
  PDP_STATE.selectedSize = p.sizes[0] || 'Standard';
  PDP_STATE.activeImage = p.image;

  document.title = `${p.name} | LEGACY (EST. 2026)`;

  // Breadcrumbs
  const bGender = document.getElementById('breadcrumbGender');
  const bTitle = document.getElementById('breadcrumbTitle');
  if (bGender) bGender.textContent = p.gender.toUpperCase();
  if (bTitle) bTitle.textContent = p.name;

  // Title, Meta, Rating
  const metaTag = document.getElementById('pdpMetaTag');
  const titleEl = document.getElementById('pdpProductTitle');
  const ratingEl = document.getElementById('pdpRatingVal');
  const reviewsEl = document.getElementById('pdpReviewsText');

  if (metaTag) metaTag.textContent = `${p.gender.toUpperCase()} · ${p.tag}`;
  if (titleEl) titleEl.textContent = p.name;
  if (ratingEl) ratingEl.textContent = p.rating.toFixed(1);
  if (reviewsEl) reviewsEl.textContent = `(${p.reviews} Verified Atelier Reviews)`;

  // Pricing
  updatePriceDisplay();

  // Floating Badge
  const badgeEl = document.getElementById('pdpFloatingBadge');
  if (badgeEl) {
    if (p.badge) {
      badgeEl.textContent = p.badge;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // Main Image & Thumbnails
  renderGallery();

  // Color Swatches
  renderColorSwatches();

  // Sizes
  renderSizes();

  // Quantity Stepper
  const qtyVal = document.getElementById('pdpQtyVal');
  const decBtn = document.getElementById('pdpQtyDec');
  const incBtn = document.getElementById('pdpQtyInc');

  if (decBtn) {
    decBtn.onclick = () => {
      if (PDP_STATE.quantity > 1) {
        PDP_STATE.quantity--;
        if (qtyVal) qtyVal.textContent = PDP_STATE.quantity;
      }
    };
  }
  if (incBtn) {
    incBtn.onclick = () => {
      PDP_STATE.quantity++;
      if (qtyVal) qtyVal.textContent = PDP_STATE.quantity;
    };
  }

  // Wishlist Button
  const wishBtn = document.getElementById('pdpWishlistBtn');
  updateWishlistUI();
  if (wishBtn) {
    wishBtn.onclick = () => {
      const isFav = PDP_STATE.wishlist.includes(p.id);
      if (isFav) {
        PDP_STATE.wishlist = PDP_STATE.wishlist.filter(id => id !== p.id);
        showToast(`Removed from Wishlist: ${p.name}`);
      } else {
        PDP_STATE.wishlist.push(p.id);
        showToast(`Added to Wishlist: ${p.name}`);
      }
      localStorage.setItem('legacy_wishlist', JSON.stringify(PDP_STATE.wishlist));
      updateWishlistUI();
    };
  }

  // Description & Features
  const descEl = document.getElementById('pdpDescriptionText');
  const featEl = document.getElementById('pdpFeaturesList');
  if (descEl) descEl.textContent = p.description;
  if (featEl) {
    featEl.innerHTML = p.features.map(f => `<li style="margin-bottom: 6px;">${f}</li>`).join('');
  }

  // Accordion Interaction
  document.querySelectorAll('.pdp-acc-trigger').forEach(trigger => {
    trigger.onclick = () => {
      const parent = trigger.closest('.pdp-acc-row');
      parent.classList.toggle('active');
    };
  });

  // Action Buttons
  const addCartBtn = document.getElementById('pdpAddToCartBtn');
  if (addCartBtn) {
    addCartBtn.onclick = () => {
      addToBag(p.id, PDP_STATE.selectedSize, PDP_STATE.selectedColor, PDP_STATE.quantity);
    };
  }

  const buyCodBtn = document.getElementById('pdpBuyCodBtn');
  if (buyCodBtn) {
    buyCodBtn.onclick = () => {
      // Add current selection and open checkout directly
      addToBag(p.id, PDP_STATE.selectedSize, PDP_STATE.selectedColor, PDP_STATE.quantity, false);
      openCheckoutModal();
    };
  }

  // Related Products
  renderRelatedProducts();
  updateCartBadge();
}

function renderGallery() {
  const p = PDP_STATE.product;
  const mainImg = document.getElementById('pdpMainImage');
  const thumbList = document.getElementById('pdpThumbList');

  if (mainImg) {
    mainImg.src = PDP_STATE.activeImage;
    mainImg.alt = p.name;
  }

  const galleryImages = [p.image];
  if (p.secondaryImage && p.secondaryImage !== p.image) {
    galleryImages.push(p.secondaryImage);
  }

  if (thumbList) {
    thumbList.innerHTML = galleryImages.map((img, idx) => `
      <div class="pdp-thumb-item ${img === PDP_STATE.activeImage ? 'active' : ''}" onclick="switchPDPImage('${img}')">
        <img src="${img}" alt="Thumbnail ${idx + 1}">
      </div>
    `).join('');
  }
}

function switchPDPImage(imgUrl) {
  PDP_STATE.activeImage = imgUrl;
  const mainImg = document.getElementById('pdpMainImage');
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = imgUrl;
      mainImg.style.opacity = '1';
    }, 150);
  }
  document.querySelectorAll('.pdp-thumb-item').forEach(thumb => {
    thumb.classList.toggle('active', thumb.querySelector('img').src.includes(imgUrl.replace('./', '')));
  });
}

function renderColorSwatches() {
  const p = PDP_STATE.product;
  const swatchesRow = document.getElementById('pdpSwatchesRow');
  const activeColorLabel = document.getElementById('pdpActiveColorName');

  if (activeColorLabel) activeColorLabel.textContent = PDP_STATE.selectedColor;

  if (swatchesRow) {
    swatchesRow.innerHTML = p.colors.map(c => `
      <div class="pdp-swatch-circle ${c.name === PDP_STATE.selectedColor ? 'active' : ''}" 
           style="background-color: ${c.code};" 
           title="${c.name}"
           onclick="selectColor('${c.name}')">
      </div>
    `).join('');
  }
}

function selectColor(colorName) {
  PDP_STATE.selectedColor = colorName;
  const activeColorLabel = document.getElementById('pdpActiveColorName');
  if (activeColorLabel) activeColorLabel.textContent = colorName;

  document.querySelectorAll('.pdp-swatch-circle').forEach(sw => {
    sw.classList.toggle('active', sw.title === colorName);
  });
}

function renderSizes() {
  const p = PDP_STATE.product;
  const sizesRow = document.getElementById('pdpSizesRow');
  const activeSizeLabel = document.getElementById('pdpActiveSizeName');

  if (activeSizeLabel) activeSizeLabel.textContent = PDP_STATE.selectedSize;

  if (sizesRow) {
    sizesRow.innerHTML = p.sizes.map(size => `
      <button class="pdp-size-chip ${size === PDP_STATE.selectedSize ? 'active' : ''}" 
              onclick="selectSize('${size}')">
        ${size}
      </button>
    `).join('');
  }
}

function selectSize(size) {
  PDP_STATE.selectedSize = size;
  const activeSizeLabel = document.getElementById('pdpActiveSizeName');
  if (activeSizeLabel) activeSizeLabel.textContent = size;

  document.querySelectorAll('.pdp-size-chip').forEach(chip => {
    chip.classList.toggle('active', chip.textContent.trim() === size);
  });
}

function openSizeGuideModal() {
  const p = PDP_STATE.product;
  if (p && p.gender === 'juniors') {
    alert(`📏 LEGACY JUNIORS SIZING GUIDE (Age & Height):\n\n• 2-3Y:  Height 92-98 cm | Chest 53 cm\n• 3-4Y:  Height 98-104 cm | Chest 56 cm\n• 5-6Y:  Height 110-116 cm | Chest 60 cm\n• 7-8Y:  Height 122-128 cm | Chest 65 cm\n• 9-10Y: Height 134-140 cm | Chest 71 cm\n• 11-12Y: Height 146-152 cm | Chest 78 cm\n• 13-14Y: Height 158-164 cm | Chest 84 cm\n\nAll pieces designed with breathable comfort stretch and room for active growth.`);
  } else {
    alert(`📏 LEGACY ATELIER SIZING GUIDE (Men & Women):\n\n• XS: Chest 36-38" | Waist 28-30"\n• S:  Chest 38-40" | Waist 30-32"\n• M:  Chest 40-42" | Waist 32-34"\n• L:  Chest 42-44" | Waist 34-36"\n• XL: Chest 44-46" | Waist 36-38"\n\nAll garments tailored in signature relaxed luxury proportions.`);
  }
}

function updatePriceDisplay() {
  const p = PDP_STATE.product;
  if (!p) return;

  const currentEl = document.getElementById('pdpPriceCurrent');
  const origEl = document.getElementById('pdpPriceOriginal');
  const pillEl = document.getElementById('pdpDiscountPill');

  if (currentEl) currentEl.textContent = formatPrice(p.price);

  if (p.originalPrice && p.originalPrice > p.price) {
    if (origEl) {
      origEl.textContent = formatPrice(p.originalPrice);
      origEl.style.display = 'inline-block';
    }
    const percent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    if (pillEl) {
      pillEl.textContent = `${percent}% OFF`;
      pillEl.style.display = 'inline-block';
    }
  } else {
    if (origEl) origEl.style.display = 'none';
    if (pillEl) pillEl.style.display = 'none';
  }
}

function updateWishlistUI() {
  const p = PDP_STATE.product;
  if (!p) return;
  const isFav = PDP_STATE.wishlist.includes(p.id);
  const wishBtn = document.getElementById('pdpWishlistBtn');
  if (wishBtn) {
    wishBtn.innerHTML = `
      <i data-lucide="heart" style="width: 20px; height: 20px; stroke: ${isFav ? '#e63946' : '#000'}; fill: ${isFav ? '#e63946' : 'none'};"></i>
    `;
    lucide.createIcons();
  }
}

function addToBag(productId, size, color, qty = 1, openDrawer = true) {
  const product = PDP_STATE.product;
  if (!product) return;

  const existingIdx = PDP_STATE.cart.findIndex(
    item => item.id === productId && item.size === size && item.color === color
  );

  if (existingIdx > -1) {
    PDP_STATE.cart[existingIdx].quantity += qty;
  } else {
    PDP_STATE.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      color: color,
      quantity: qty
    });
  }

  localStorage.setItem('legacy_cart', JSON.stringify(PDP_STATE.cart));
  updateCartBadge();
  updateCartUI();
  showToast(`Added to Bag: ${product.name} (${size} · ${color})`);

  if (openDrawer) {
    openCart();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    const totalCount = PDP_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
  }
}

function renderRelatedProducts() {
  const container = document.getElementById('pdpRelatedGrid');
  if (!container || !PDP_STATE.product || typeof PRODUCTS_DATA === 'undefined') return;

  const current = PDP_STATE.product;
  // Get 4 matching products
  const related = PRODUCTS_DATA
    .filter(p => p.id !== current.id && (p.gender === current.gender || p.category === current.category))
    .slice(0, 4);

  container.innerHTML = related.map(p => `
    <div class="product-card" onclick="openProductPage('${p.id}')" style="cursor: pointer;">
      <div class="product-image-container">
        ${p.badge ? `<span class="product-badge-pill">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-quick-actions">
          <button class="quick-action-btn" onclick="event.stopPropagation(); openProductPage('${p.id}')">
            View Details
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-brand-tag">${p.gender.toUpperCase()} · ${p.tag}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price-row">
          <span class="product-current-price">${formatPrice(p.price)}</span>
          ${p.originalPrice ? `<span class="product-original-price">${formatPrice(p.originalPrice)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openProductPage(id) {
  window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

// ----------------------------------------------------
// Cart Operations & Drawer
// ----------------------------------------------------
function initCartDrawer() {
  const openBtn = document.getElementById('openCartBtn');
  const closeBtn = document.getElementById('closeCartBtn');
  const backdrop = document.getElementById('cartBackdrop');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');

  if (openBtn) openBtn.onclick = openCart;
  if (closeBtn) closeBtn.onclick = closeCart;
  if (backdrop) backdrop.onclick = closeCart;
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      closeCart();
      openCheckoutModal();
    };
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

function updateCartUI() {
  const list = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const progressText = document.getElementById('freeShippingText');
  const progressFill = document.getElementById('shippingProgressFill');

  updateCartBadge();

  if (!list) return;

  if (PDP_STATE.cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: var(--color-gray-mid);">
        <i data-lucide="shopping-bag" style="width: 44px; height: 44px; margin-bottom: 12px; stroke: #999;"></i>
        <p style="font-family: var(--font-brand); text-transform: uppercase; font-size: 0.85rem;">Your Shopping Bag is Empty</p>
        <a href="index.html" style="display: inline-block; margin-top: 14px; font-size: 0.75rem; text-decoration: underline; color: #000;">
          Explore FW26 Catalog
        </a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    if (progressFill) progressFill.style.width = '0%';
    lucide.createIcons();
    return;
  }

  let subtotal = 0;
  list.innerHTML = PDP_STATE.cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">Size: ${item.size} · Color: ${item.color}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn" onclick="updateCartQty(${index}, -1)">−</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);

  // Free shipping progress in Pakistan
  const threshold = 3500;
  if (progressFill && progressText) {
    if (subtotal >= threshold) {
      progressFill.style.width = '100%';
      progressFill.style.backgroundColor = '#137333';
      progressText.innerHTML = `🎉 <strong>Congratulations!</strong> You have qualified for <strong>FREE EXPRESS DELIVERY IN PAKISTAN</strong>.`;
    } else {
      const remaining = threshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
      progressFill.style.width = `${pct}%`;
      progressFill.style.backgroundColor = 'var(--color-black)';
      progressText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more for <strong>FREE EXPRESS DELIVERY IN PAKISTAN</strong>`;
    }
  }

  lucide.createIcons();
}

function updateCartQty(index, change) {
  if (PDP_STATE.cart[index]) {
    PDP_STATE.cart[index].quantity += change;
    if (PDP_STATE.cart[index].quantity <= 0) {
      PDP_STATE.cart.splice(index, 1);
    }
    localStorage.setItem('legacy_cart', JSON.stringify(PDP_STATE.cart));
    updateCartUI();
  }
}

function removeFromCart(index) {
  if (PDP_STATE.cart[index]) {
    const item = PDP_STATE.cart[index];
    PDP_STATE.cart.splice(index, 1);
    localStorage.setItem('legacy_cart', JSON.stringify(PDP_STATE.cart));
    updateCartUI();
    showToast(`Removed from Bag: ${item.name}`);
  }
}

// ----------------------------------------------------
// Checkout Flow with Pakistani Cities & COD
// ----------------------------------------------------
function initCheckoutFlow() {
  const closeBtn = document.getElementById('closeCheckoutBtn');
  const form = document.getElementById('checkoutForm');

  if (closeBtn) closeBtn.onclick = closeCheckoutModal;
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      alert(`🎉 ORDER CONFIRMED!\n\nThank you for choosing LEGACY (EST. 2026).\nYour parcel has been booked for nationwide dispatch with Cash on Delivery (COD).\nEstimated arrival: 2-4 business days via Express Courier.`);
      PDP_STATE.cart = [];
      localStorage.setItem('legacy_cart', JSON.stringify(PDP_STATE.cart));
      updateCartUI();
      closeCheckoutModal();
    };
  }
}

function openCheckoutModal() {
  document.getElementById('checkoutModal')?.classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal')?.classList.remove('open');
}

// ----------------------------------------------------
// Currency Selector
// ----------------------------------------------------
function initCurrencySelector() {
  const select = document.getElementById('currencySelect');
  if (select) {
    select.value = PDP_STATE.currency;
    select.onchange = (e) => {
      PDP_STATE.currency = e.target.value;
      localStorage.setItem('legacy_currency', PDP_STATE.currency);
      updatePriceDisplay();
      updateCartUI();
      renderRelatedProducts();
      showToast(`Currency updated to ${PDP_STATE.currency}`);
    };
  }
}

// ----------------------------------------------------
// Toast Notification System
// ----------------------------------------------------
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `
    <i data-lucide="check-circle" style="width: 18px; height: 18px; color: #4ade80;"></i>
    <span>${msg}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
