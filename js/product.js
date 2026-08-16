const qtyMap = new Map();
let semuaProduk = [];
let currentCategory = 'semua';
let currentSearch = '';


if (typeof sudahLogin === 'undefined') {
    window.sudahLogin = function() {
        const user = localStorage.getItem('user');
        if (!user) return false;
        try {
            const parsed = JSON.parse(user);
            return parsed !== null && parsed !== undefined;
        } catch {
            return false;
        }
    }
}

async function getProduct() {
    try {
        const response = await fetch('http://localhost:3000/api/produk');
        const data = await response.json();
        semuaProduk = data.data;
        renderProduk(semuaProduk);
    } catch (error) {
        console.error('Failed to load products:', error);
        const container = document.getElementById('container');
        if (container) container.innerHTML = '<p class="col-span-full text-center text-red-600">Gagal memuat produk.</p>';
    }
}

function renderProduk(produkList) {
    const container = document.getElementById('container');
    if (!container) return;
    container.innerHTML = '';
    if (produkList.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Produk tidak ditemukan.</p>';
        return;
    }
    produkList.forEach(p => {
        qtyMap.set(p.id, 1);
        const productCard = `
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="cursor-pointer" onclick="bukaDetail(${p.id})">
                <div class="relative">
                    <div class="absolute top-3 left-3 z-10">
                        <span class="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm border border-gray-100">${p.kategori}</span>
                    </div>
                    <div class="w-full flex items-center justify-center bg-white" style="height:200px;">
                        <img src="${p.gambar}" alt="${p.nama}" class="object-contain p-4" style="max-height:180px; max-width:100%;" />
                    </div>
                </div>
                <div class="flex flex-col flex-1 p-4 gap-1">
                    <h2 class="text-base font-bold text-gray-900 leading-snug">${p.nama}</h2>
                    <p class="text-xs text-gray-400 leading-relaxed overflow-hidden" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${p.deskripsi}</p>
                    <p class="text-lg font-black text-gray-900 mt-2">Rp ${p.harga.toLocaleString('id-ID')}</p>
                </div>
            </div>
            <div class="flex gap-2 px-4 pb-4 items-center">
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onclick="updateQty(${p.id}, -1)" class="px-4 py-2 text-gray-500 hover:bg-gray-50 text-lg font-bold">−</button>
                    <span class="px-4 py-2 text-sm font-semibold text-gray-800 border-x border-gray-200 qty-display" data-id="${p.id}">1</span>
                    <button onclick="updateQty(${p.id}, 1)" class="px-4 py-2 text-gray-500 hover:bg-gray-50 text-lg font-bold">+</button>
                </div>
                <button onclick="tambahKeranjang(${p.id})" class="flex-1 bg-emerald-600 text-white text-xs font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </button>
            </div>
        </div>
        `;
        container.innerHTML += productCard;
    });
}

function filterKategori(kategori) {
    currentCategory = kategori;
    const dropdown = document.getElementById('kategori-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    applyFilters();
}

function searchProduk(query) {
    currentSearch = query.trim().toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = semuaProduk;

    if (currentCategory && currentCategory !== 'semua') {
        filtered = filtered.filter(p => p.kategori.toLowerCase() === currentCategory.toLowerCase());
    }

    if (currentSearch) {
        filtered = filtered.filter(p => {
            const term = currentSearch;
            return p.nama.toLowerCase().includes(term)
                || p.deskripsi.toLowerCase().includes(term)
                || p.kategori.toLowerCase().includes(term);
        });
    }

    renderProduk(filtered);
}

function bukaDetail(id) {
    if (!sudahLogin()) {
        window.location.href = 'login.html';
        return;
    }
    window.location.href = `detail.html?id=${id}`;
}

function updateQty(id, delta) {
    const current = qtyMap.get(id) ?? 1;
    const next = Math.max(1, current + delta);
    qtyMap.set(id, next);
    const el = document.querySelector(`.qty-display[data-id="${id}"]`);
    if (el) el.textContent = next;
}

function tambahKeranjang(id) {
    if (!sudahLogin()) {
        window.location.href = 'login.html';
        return;
    }

    const qty = qtyMap.get(id) ?? 1;
    const produk = semuaProduk.find(p => p.id === id);
    if (!produk) {
        alert('Produk tidak ditemukan.');
        return;
    }

    addCartItem(produk, qty);
    alert(`${qty} item ${produk.nama} berhasil ditambahkan ke keranjang.`);
    updateQty(id, -(qty - 1));
}

function bindSearchInput() {
    const searchInput = document.getElementById('product-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (event) => {
        searchProduk(event.target.value);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    bindSearchInput();
});

getProduct();