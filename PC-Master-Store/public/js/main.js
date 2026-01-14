const translations = {
    ar: {
        add_cart: "إضافة للسلة",
        price_unit: "د.أ",
        cart_title: "سلة المشتريات",
        checkout: "إتمام الطلب",
        empty: "السلة فارغة",
        new_badge: "جديد"
    },
    en: {
        add_cart: "Add to Cart",
        price_unit: "JOD",
        cart_title: "Shopping Cart",
        checkout: "Checkout",
        empty: "Cart is empty",
        new_badge: "NEW"
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let currentCategory = 'all';
let currentBrand = '';
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    updateCartCount();
    loadData(`/api/products`);
});

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
    loadData(buildUrl());
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-text').innerText = lang === 'ar' ? 'EN' : 'AR';
    
    // النصوص الثابتة يمكن ترجمتها هنا إذا أردت
    const t = translations[lang];
    document.getElementById('cart-title').innerText = t.cart_title;
}

function filterProducts(category) {
    currentCategory = category;
    loadData(buildUrl());
}

function filterByBrand(brand) {
    if (currentBrand === brand) currentBrand = '';
    else currentBrand = brand;
    loadData(buildUrl());
}

function buildUrl() {
    let url = `/api/products?category=${currentCategory}`;
    if (currentBrand) url += `&brand=${currentBrand}`;
    return url;
}

async function loadData(url) {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div style="color:white; padding:20px;">Scanning System...</div>';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        container.innerHTML = '';
        
        if(data.data.length === 0) { 
            container.innerHTML = '<p style="color:#aaa;">No Gear Found.</p>'; return; 
        }

        const t = translations[currentLang];

        data.data.forEach(product => {
            const name = currentLang === 'ar' ? product.name_ar : product.name_en;
            const badge = product.is_new ? `<span class="badge-new">${t.new_badge}</span>` : '';
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                ${badge}
                <div class="img-container">
                    <img src="${product.image}" onerror="this.src='https://via.placeholder.com/300'">
                </div>
                <h3>${name}</h3>
                <span class="price">${product.price} ${t.price_unit}</span>
                <button class="cta-btn" onclick='addToCart(${JSON.stringify(product)})'>
                    <i class="fa-solid fa-cart-plus"></i> ${t.add_cart}
                </button>
            `;
            container.appendChild(card);
        });
    } catch(e) { console.error(e); }
}

function addToCart(product) {
    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartCount();
    showToast("Gear Added!");
}

function updateCartCount() { document.getElementById('cart-count').innerText = cart.length; }

function openCart() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0;
    
    if(cart.length === 0) container.innerHTML = `<p style="color:#aaa; text-align:center;">Empty.</p>`;

    cart.forEach((item, index) => {
        total += item.price;
        const name = currentLang === 'ar' ? item.name_ar : item.name_en;
        container.innerHTML += `
            <div class="cart-item">
                <div style="color:white;">${name}</div>
                <div style="color:var(--primary); font-weight:bold;">${item.price}</div>
                <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('cart-modal').classList.add('active');
}

function removeFromCart(i) { cart.splice(i,1); localStorage.setItem('myCart', JSON.stringify(cart)); openCart(); updateCartCount(); }
function closeCart() { document.getElementById('cart-modal').classList.remove('active'); }
function checkout() { alert("Mission Complete! Order Placed."); cart=[]; localStorage.setItem('myCart', JSON.stringify(cart)); closeCart(); updateCartCount(); }

function showToast(msg) {
    const box = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.style.cssText = "background:#1e1e1e; color:white; padding:15px; border-left:3px solid #00ff88; margin-top:10px; border-radius:5px;";
    toast.innerText = msg;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}