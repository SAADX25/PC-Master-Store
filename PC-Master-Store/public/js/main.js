const translations = {
    ar: {
        add_cart: "إضافة للسلة", price_unit: "د.أ", cart_title: "سلة المشتريات", checkout: "إتمام الشراء", empty: "السلة فارغة", new_badge: "جديد",
        brand: "الماركة", release: "الإصدار", delivery: "التوصيل", stock: "المخزون", units: "قطع"
    },
    en: {
        add_cart: "Add to Cart", price_unit: "JOD", cart_title: "Shopping Cart", checkout: "Checkout", empty: "Cart is empty", new_badge: "NEW",
        brand: "Brand", release: "Released", delivery: "Delivery", stock: "Stock", units: "Units"
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let currentCategory = 'all';
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
    loadData(`/api/products?category=${currentCategory}`);
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
        container.innerHTML = '';
        
        if(data.data.length === 0) { 
            container.innerHTML = '<p style="color:#aaa;">No Gear Found.</p>'; return; 
        }

        const t = translations[currentLang];

        data.data.forEach(p => {
            const name = currentLang === 'ar' ? p.name_ar : p.name_en;
            const badge = p.is_new ? `<span class="badge-new">${t.new_badge}</span>` : '';
            
            const card = document.createElement('div');
            card.className = 'card';
            // هنا نمرر الكائن p بالكامل للدالة لكي تعرض تفاصيله
            card.innerHTML = `
                ${badge}
                <div class="img-container" onclick='openProductModal(${JSON.stringify(p)})'>
                    <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300'">
                </div>
                <h3>${name}</h3>
                <span class="price">${p.price} ${t.price_unit}</span>
                <button class="cta-btn" onclick='addToCart(${JSON.stringify(p)})'>
                    ${t.add_cart} <i class="fa-solid fa-cart-plus"></i>
                </button>
            `;
            container.appendChild(card);
        });
    } catch(e) { console.error(e); }
}

// --- 1. المودال: عرض التفاصيل الكاملة ---
function openProductModal(p) {
    const t = translations[currentLang];
    const name = currentLang === 'ar' ? p.name_ar : p.name_en;
    const desc = currentLang === 'ar' ? p.description_ar : p.description_en;
    
    // HTML يعرض الصورة يساراً والتفاصيل يميناً
    const modalHTML = `
        <div class="modal-body">
            <button class="close-modal" onclick="closeProductModal()">✕</button>
            <div class="modal-left">
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <div class="modal-right">
                <h2 style="color:var(--primary); margin-top:0; font-size:24px;">${name}</h2>
                <p style="color:#ccc; line-height:1.6; border-bottom:1px solid #333; padding-bottom:15px;">${desc}</p>
                
                <div class="info-grid">
                    <div class="info-item"><span>${t.brand}</span><strong>${p.brand || 'N/A'}</strong></div>
                    <div class="info-item"><span>${t.release}</span><strong>${p.release_date || '2024'}</strong></div>
                    <div class="info-item"><span>${t.delivery}</span><strong><i class="fa-solid fa-truck-fast"></i> ${p.delivery_status || 'Ready'}</strong></div>
                    <div class="info-item"><span>${t.stock}</span><strong style="color:var(--primary)">${p.quantity || 1} ${t.units}</strong></div>
                </div>

                <div style="margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <h3 style="font-size:32px; margin:0;">${p.price} <span style="font-size:16px">${t.price_unit}</span></h3>
                    <button class="cta-btn" style="width:auto; padding:10px 30px;" onclick='addToCartAndClose(${JSON.stringify(p)})'>
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
function addToCartAndClose(p) { addToCart(p); closeProductModal(); }

// --- 2. السلة: عرض الصورة مع المنتج ---
function addToCart(p) {
    cart.push(p);
    localStorage.setItem('myCart', JSON.stringify(cart));
    updateCartCount();
    alert("Added!"); // تنبيه سريع (يمكن استبداله بـ Toast)
}
function updateCartCount() { document.getElementById('cart-count').innerText = cart.length; }

function openCart() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0;
    
    if(cart.length === 0) container.innerHTML = `<p style="text-align:center; color:#777;">Empty Cart</p>`;

    cart.forEach((item, index) => {
        total += item.price;
        const name = currentLang === 'ar' ? item.name_ar : item.name_en;
        // هنا أضفنا عنصر الصورة <img>
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img-preview">
                <div class="cart-details">
                    <div class="cart-name">${name}</div>
                    <div class="cart-price">${item.price}</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('cart-modal').classList.add('active');
}

function removeFromCart(i) { cart.splice(i,1); localStorage.setItem('myCart', JSON.stringify(cart)); openCart(); updateCartCount(); }
function closeCart() { document.getElementById('cart-modal').classList.remove('active'); }

function checkout() {
    if(cart.length === 0) return alert("السلة فارغة!");
    window.location.href = "payment.html";
}