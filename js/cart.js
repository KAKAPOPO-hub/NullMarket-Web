function getCart() {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getSelectedCartIds() {
    const raw = localStorage.getItem('selectedCartIds');
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveSelectedCartIds(ids) {
    localStorage.setItem('selectedCartIds', JSON.stringify(ids));
}

function clearSelectedCartIds() {
    localStorage.removeItem('selectedCartIds');
}

function toggleCartItemSelection(id) {
    const selectedIds = getSelectedCartIds();
    const isSelected = selectedIds.includes(id);
    const updated = isSelected ? selectedIds.filter(itemId => itemId !== id) : [...selectedIds, id];
    saveSelectedCartIds(updated);
    renderCartPage();
}

function setAllCartItemsSelection(checked) {
    const cart = getCart();
    const selectedIds = checked ? cart.map(item => item.id) : [];
    saveSelectedCartIds(selectedIds);
    renderCartPage();
}

function getSelectedCartItems() {
    const selectedIds = new Set(getSelectedCartIds());
    return getCart().filter(item => selectedIds.has(item.id));
}

function addCartItem(product, qty) {
    if (!product || qty <= 0) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += qty;
        existing.qty = Math.max(1, existing.qty);
    } else {
        cart.push({
            id: product.id,
            nama: product.nama,
            harga: product.harga,
            gambar: product.gambar,
            kategori: product.kategori,
            satuan: product.satuan,
            qty,
            stok: product.stok
        });
    }

    saveCart(cart);
}

function getCartItemCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(value) {
    return value.toLocaleString('id-ID');
}

function changeCartQty(id, delta) {
    const cart = getCart();
    const item = cart.find(entry => entry.id === id);
    if (!item) return;

    item.qty = Math.max(1, item.qty + delta);
    if (item.qty <= 0) {
        return removeCartItem(id);
    }

    saveCart(cart);
    renderCartPage();
}

function removeCartItem(id) {
    const cart = getCart().filter(entry => entry.id !== id);
    saveCart(cart);
    const selectedIds = getSelectedCartIds().filter(itemId => itemId !== id);
    saveSelectedCartIds(selectedIds);
    renderCartPage();
}

function renderCartPage() {
    const cartContainer = document.getElementById('cart-content');
    const summaryContainer = document.getElementById('cart-summary');
    const countBadge = document.getElementById('cart-count-badge');
    if (!cartContainer || !summaryContainer) return;

    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const selectedCart = getSelectedCartItems();
    const selectedTotal = selectedCart.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const selectedIds = getSelectedCartIds();
    const allSelected = cart.length > 0 && selectedIds.length === cart.length;

    if (countBadge) {
        countBadge.textContent = cart.length > 0 ? `(${getCartItemCount()})` : '(0)';
    }

    if (cart.length === 0) {
        cartContainer.innerHTML = `
          <div class="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p class="text-xl font-bold text-gray-900 mb-2">Keranjang kosong</p>
            <p class="text-sm text-gray-500 mb-6">Tambahkan produk ke keranjang untuk mulai berbelanja.</p>
            <a href="index.html" class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">Kembali belanja</a>
          </div>
        `;
        summaryContainer.innerHTML = `
          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
            <div class="text-sm text-gray-500 mb-4">Tidak ada item di keranjang.</div>
          </div>
        `;
        clearSelectedCartIds();
        return;
    }

    const cartItemsHtml = cart.map(item => {
      const checkedAttribute = selectedIds.includes(item.id) ? 'checked' : '';
      return `
      <article class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
        <div class="flex flex-col gap-4 md:items-center md:flex-row">
          <label class="inline-flex items-center gap-3 text-gray-700 text-sm">
            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" onclick="toggleCartItemSelection(${item.id})" ${checkedAttribute} />
            Pilih produk
          </label>
          <img src="${item.gambar}" alt="${item.nama}" class="h-32 w-32 rounded-3xl object-cover border border-gray-100 bg-gray-50" />
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900">${item.nama}</h3>
            <p class="text-sm text-gray-500 mt-2">${item.kategori} · ${item.satuan}</p>
            <p class="mt-3 text-lg font-black text-emerald-600">Rp ${formatPrice(item.harga)}</p>
          </div>
          <div class="flex flex-col gap-3 items-start md:items-end">
            <div class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 overflow-hidden text-sm">
              <button onclick="changeCartQty(${item.id}, -1)" class="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
              <span class="px-4 py-2 font-semibold text-gray-800">${item.qty}</span>
              <button onclick="changeCartQty(${item.id}, 1)" class="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
            <button onclick="removeCartItem(${item.id})" class="text-sm font-semibold text-red-500 hover:text-red-600">Hapus</button>
          </div>
        </div>
        <div class="mt-5 flex items-center justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span class="font-semibold text-gray-900">Rp ${formatPrice(item.harga * item.qty)}</span>
        </div>
      </article>`;
    }).join('');

    cartContainer.innerHTML = `
      <div class="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="inline-flex items-center gap-3 text-gray-700 text-sm">
          <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" onchange="setAllCartItemsSelection(this.checked)" ${allSelected ? 'checked' : ''} />
          Pilih Semua
        </label>
        <span class="text-sm text-gray-600">${selectedCart.length} produk dipilih</span>
      </div>
      ${cartItemsHtml}
    `;

    const summaryText = selectedCart.length > 0 ? `
          <div class="flex justify-between text-sm text-gray-500 mb-3">
            <span>Produk dipilih</span>
            <span>${selectedCart.length} jenis</span>
          </div>
          <div class="flex justify-between text-sm text-gray-500 mb-4">
            <span>Total item terpilih</span>
            <span>${selectedCart.reduce((sum, item) => sum + item.qty, 0)} buah</span>
          </div>
          <div class="flex justify-between text-sm text-gray-500 mb-4">
            <span>Subtotal dipilih</span>
            <span class="font-semibold text-gray-900">Rp ${formatPrice(selectedTotal)}</span>
          </div>
        ` : `
          <div class="text-sm text-gray-500 mb-4">Pilih produk terlebih dahulu untuk melanjutkan ke pembayaran.</div>
        `;

    summaryContainer.innerHTML = `
      <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
        <div class="flex justify-between text-sm text-gray-500 mb-3">
          <span>Jumlah item</span>
          <span>${getCartItemCount()} buah</span>
        </div>
        ${summaryText}
        <div class="rounded-2xl bg-emerald-50 p-4 mb-5 text-sm text-emerald-700">Pengiriman dan pajak akan dihitung di halaman checkout.</div>
        <button onclick="checkoutCart()" ${selectedCart.length === 0 ? 'disabled' : ''} class="w-full rounded-2xl px-5 py-3 text-sm font-bold text-white transition-colors ${selectedCart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}">Lanjutkan ke Pembayaran</button>
      </div>
    `;
}

function checkoutCart() {
    const selectedItems = getSelectedCartItems();
    if (selectedItems.length === 0) {
        alert('Pilih minimal satu produk terlebih dahulu.');
        return;
    }
    localStorage.setItem('checkoutCart', JSON.stringify(selectedItems));
    window.location.href = 'payment.html';
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-content')) {
        renderCartPage();
    }
});
