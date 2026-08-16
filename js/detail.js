function sudahLogin() {
  return localStorage.getItem('user') !== null;
}

const params = new URLSearchParams(location.search);
const id = params.get('id') || 1;
let currentProduct = null;

if (!sudahLogin()) {
  window.location.href = 'login.html';
} else {
  TampilDetail(id);
}

async function TampilDetail(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/produk/${id}`);
        const json = await res.json();
        const produk = json.data;
        currentProduct = produk;

        const detail = document.getElementById('detail-produk');
        if (!detail) return;

        // detail.className = "max-w-7xl mx-auto py-10 px-6";

        detail.innerHTML = `
<div class="bg-white rounded-2xl shadow-sm overflow-hidden">

    <div class="px-8 py-4 border-b border-gray-100 text-sm text-gray-400">
        Beranda &rsaquo; <span class="text-gray-500">${produk.kategori}</span> &rsaquo; <span class="text-gray-700">${produk.nama}</span>
    </div>

    <div class="flex gap-0">
        <div class="flex flex-col items-center gap-4 p-8 shrink-0" style="width:520px;">
            <div class="w-full rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center" style="height:420px; background:#f8fafc;">
                <img src="${produk.gambar}" alt="${produk.nama}"
                     class="object-contain" style="max-height:380px; max-width:100%;" />
            </div>
        </div>

        <div class="w-px bg-gray-100 my-8"></div>

        <div class="flex flex-col p-10 flex-1 gap-5">

            <div>
                <span class="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full font-semibold uppercase tracking-widest">${produk.kategori}</span>
                <h1 class="text-4xl font-black text-gray-900 mt-3 leading-snug">${produk.nama}</h1>
            </div>

            <div class="py-4 border-t border-b border-gray-100">
                <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Harga</p>
                <p class="text-5xl font-black text-emerald-600">Rp ${(produk.harga ?? 0).toLocaleString('id-ID')}</p>
            </div>

            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-400 w-20">Satuan</span>
                    <span class="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">${produk.satuan}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-400 w-20">Stok</span>
                    <span class="text-sm font-semibold px-3 py-1 rounded-lg ${produk.stok > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}">
                        ${produk.stok > 0 ? produk.stok + ' tersedia' : 'Habis'}
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-3 mt-2">
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button data-qty-change="-1" class="px-5 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold transition-colors">−</button>
                    <span id="qty-display" class="px-6 py-3 text-sm font-semibold text-gray-800 border-x border-gray-200">1</span>
                    <button data-qty-change="1" class="px-5 py-3 text-gray-500 hover:bg-gray-50 text-lg font-bold transition-colors">+</button>
                </div>
                <button data-add-to-cart="true" class="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed" ${produk.stok === 0 ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Tambah ke Keranjang
                </button>
                <button class="border border-gray-200 hover:border-red-300 hover:text-red-400 text-gray-300 p-3 rounded-xl transition-all active:scale-95">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
            </div>

            <div class="mt-2 bg-gray-50 rounded-xl p-5 flex flex-col gap-3 text-sm text-gray-500">
                <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/></svg>
                    <span>Pengiriman tersedia ke seluruh wilayah</span>
                </div>
                <div class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Produk segar berkualitas terjamin</span>
                </div>
            </div>

        </div>
    </div>
</div>
`;
        qty = 1;
        updateQtyDisplay();
        bindDetailEvents(produk.id);
        recommend(produk.id, produk.kategori);
    } catch (err) {
        console.error('Failed to load product detail', err);
        const detail = document.getElementById('detail-produk');
        if (detail) detail.innerHTML = '<p class="text-center text-red-600">Gagal memuat detail produk.</p>';
    }
}

async function recommend(produkId, kategori) {
    try {
        const res = await fetch('http://localhost:3000/api/produk');
        const json = await res.json();

      
        const related = json.data.filter(p => p.kategori === kategori && p.id != produkId);

        const recom = document.getElementById('recommend-produk');
        if (!recom) return;

        recom.innerHTML = `
            <div class="grid grid-cols-4 gap-4 mt-19">
                ${related.map(p => `
                    <a href="detail.html?id=${p.id}" class="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all flex flex-col gap-2">
                        <div class="flex items-center justify-center bg-white rounded-xl" style="height:140px;">
                            <img src="${p.gambar}" alt="${p.nama}" class="object-contain" style="max-height:120px;" />
                        </div>
                        <p class="text-sm font-bold text-gray-900">${p.nama}</p>
                        <p class="text-sm font-black text-emerald-600">Rp ${p.harga.toLocaleString('id-ID')}</p>
                    </a>
                `).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Failed to load recommendations', err);
    }
}

function updateQtyDisplay() {
    const el = document.getElementById('qty-display');
    if (el) el.textContent = qty;
}

function bindDetailEvents(id) {
    const detail = document.getElementById('detail-produk');
    if (!detail) return;

    detail.querySelectorAll('[data-qty-change]').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const delta = Number(button.dataset.qtyChange ?? 0);
            ubahQty(delta);
        });
    });

    const addButton = detail.querySelector('[data-add-to-cart]');
    if (addButton) {
        addButton.addEventListener('click', event => {
            event.preventDefault();
            tambahKeKeranjang(id);
        });
    }
}


let qty = 1;
function ubahQty(delta) {
    qty = Math.max(1, qty + delta);
    const el = document.getElementById('qty-display');
    if (el) el.textContent = qty;
}

function tambahKeKeranjang(id) {
    if (!sudahLogin()) {
        window.location.href = 'login.html';
        return;
    }

    if (!currentProduct || currentProduct.id !== id) {
        alert('Produk tidak ditemukan.');
        return;
    }

    addCartItem(currentProduct, qty);
    alert(`${qty} item ${currentProduct.nama} berhasil ditambahkan ke keranjang.`);
}