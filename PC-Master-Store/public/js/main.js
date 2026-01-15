const translations = {
    ar: {
        add_cart: "إضافة للسلة", price_unit: "د.أ", cart_title: "سلة المشتريات", checkout: "إتمام الشراء", empty: "السلة فارغة", new_badge: "جديد",
        brand: "الماركة", release: "الإصدار", delivery: "التوصيل", stock: "المخزون", units: "قطع", details: "التفاصيل"
    },
    en: {
        add_cart: "Add to Cart", price_unit: "JOD", cart_title: "Shopping Cart", checkout: "Checkout", empty: "Cart is empty", new_badge: "NEW",
        brand: "Brand", release: "Released", delivery: "Delivery", stock: "Stock", units: "Units", details: "Details"
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark'; // تخزين الوضع
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('myCart')) || [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    applyTheme(currentTheme); // تشغيل الوضع المحفوظ
    updateCartCount();
    loadData(`/api/products`);
});

// --- وظائف الثيم (جديد) ---
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (theme === 'light') {
        body.classList.add('light-mode');
        icon.className = 'fa-solid fa-sun'; // شمس
    } else {
        body.classList.remove('light-mode');
        icon.className = 'fa-solid fa-moon'; // قمر
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
    renderProducts();
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-text').innerText = lang === 'ar' ? 'EN' : 'AR';
}

async function loadData(url) {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div style="color:white; padding:20px;">Scanning System...</div>';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if(data.data.length === 0) { 
            container.innerHTML = '<p style="color:#aaa;">No Gear Found.</p>'; return; 
        }

        allProducts = data.data; 
        renderProducts();

    } catch(e) { console.error(e); }
}

function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    const t = translations[currentLang];

    allProducts.forEach((p, index) => {
        const name = currentLang === 'ar' ? p.name_ar : p.name_en;
        const badge = p.is_new ? `<span class="badge-new">${t.new_badge}</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${badge}
            <div class="img-container" onclick="openProductModal(${index})">
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <h3>${name}</h3>
            <span class="price">${p.price} ${t.price_unit}</span>
            <button class="cta-btn" onclick="addToCart(${index})">
                ${t.add_cart} <i class="fa-solid fa-cart-plus"></i>
            </button>
        `;
        container.appendChild(card);
    });
}

// --- المودال المحدث (يعالج مشكلة النص) ---
function openProductModal(index) {
    const p = allProducts[index]; 
    const t = translations[currentLang];
    
    const name = currentLang === 'ar' ? p.name_ar : p.name_en;
    let desc = currentLang === 'ar' ? p.description_ar : p.description_en;
    
    // تحويل الـ Enter إلى سطر جديد في HTML
    if(desc) desc = desc.replace(/\n/g, '<br>');

    const modalHTML = `
        <div class="modal-body">
            <button class="close-modal" onclick="closeProductModal()">✕</button>
            <div class="modal-left">
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <div class="modal-right">
                <h2 style="color:var(--primary); margin-top:0; font-size:24px;">${name}</h2>
                
                <div style="color:var(--text-muted); line-height:1.8; border-bottom:1px solid var(--border); padding-bottom:15px; margin-bottom:15px; font-size:15px;">
                    ${desc || 'No description available.'}
                </div>
                
                <div class="info-grid">
                    <div class="info-item"><span>${t.brand}</span><strong>${p.brand || 'N/A'}</strong></div>
                    <div class="info-item"><span>${t.release}</span><strong>${p.release_date || '2024'}</strong></div>
                    <div class="info-item"><span>${t.delivery}</span><strong><i class="fa-solid fa-truck-fast"></i> ${p.delivery_status || 'Ready'}</strong></div>
                    <div class="info-item"><span>${t.stock}</span><strong style="color:var(--primary)">${p.quantity || 1} ${t.units}</strong></div>
                </div>

                <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between;">
                    <h3 style="font-size:32px; margin:0;">${p.price} <span style="font-size:16px">${t.price_unit}</span></h3>
                    <button class="cta-btn" style="width:auto; padding:10px 30px;" onclick="addToCartAndClose(${index})">
                        ${t.add_cart}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('#product-modal .modal-content').innerHTML = modalHTML;
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() { document.getElementById('product-modal').classList.remove('active'); }
function addToCartAndClose(index) { addToCart(index); closeProductModal(); }

function addToCart(index) {
    let product;
    if (typeof index === 'object') product = index;
    else product = allProducts[index];

    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartCount();
    // يمكنك إضافة alert هنا إذا أردت
}

function updateCartCount() { document.getElementById('cart-count').innerText = cart.length; }

function openCart() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0;
    
    if(cart.length === 0) container.innerHTML = `<p style="text-align:center; color:var(--text-muted);">Empty Cart</p>`;

    cart.forEach((item, index) => {
        total += item.price;
        const name = currentLang === 'ar' ? item.name_ar : item.name_en;
        
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img-preview" onerror="this.src='https://via.placeholder.com/50'">
                <div class="cart-details">
                    <div class="cart-name">${name}</div>
                    <div class="cart-price">${item.price} ${translations[currentLang].price_unit}</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
    document.getElementById('cart-total-price').innerText = total + " " + translations[currentLang].price_unit;
    document.getElementById('cart-modal').classList.add('active');
}

function removeFromCart(i) { cart.splice(i,1); localStorage.setItem('myCart', JSON.stringify(cart)); openCart(); updateCartCount(); }
function closeCart() { document.getElementById('cart-modal').classList.remove('active'); }

function checkout() {
    if(cart.length === 0) return alert("السلة فارغة!");
    window.location.href = "payment.html";
}

function searchProducts(v) { loadData(`/api/products?search=${v}`); }
function filterProducts(c) { currentCategory = c; loadData(`/api/products?category=${c}`); }
function filterByBrand(b) { /* يمكنك إضافة كود الفلترة هنا لاحقاً */ }