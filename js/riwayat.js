function formatPrice(price) {
  return price.toLocaleString('id-ID');
}
let riwayatState = {
  allOrders: [],
  query: '',
  sort: 'newest'
};

function loadRiwayat() {
  riwayatState.allOrders = JSON.parse(localStorage.getItem('riwayatPesanan') || '[]');
}

function applyFiltersAndSort(orders) {
  let filtered = orders.slice();
  const q = riwayatState.query.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(o => {
      const inId = (String(o.id || '')).toLowerCase().includes(q);
      const inItems = (o.items || []).some(i => (i.nama || '').toLowerCase().includes(q));
      return inId || inItems;
    });
  }

  switch (riwayatState.sort) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'highest':
      filtered.sort((a, b) => (b.total || 0) - (a.total || 0));
      break;
    case 'lowest':
      filtered.sort((a, b) => (a.total || 0) - (b.total || 0));
      break;
    default:
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return filtered;
}

function toggleDetails(ev) {
  const btn = ev.currentTarget;
  const article = btn.closest('article');
  if (!article) return;
  const detail = article.querySelector('.order-details');
  if (!detail) return;
  detail.classList.toggle('hidden');
  btn.textContent = detail.classList.contains('hidden') ? 'Lihat Detail' : 'Sembunyikan';
}

function renderRiwayat() {
  const userRiwayatContainer = document.getElementById('user-riwayat');
  if (!userRiwayatContainer) return;

  const riwayatPesanan = Array.isArray(riwayatState.allOrders) ? riwayatState.allOrders : [];
  if (riwayatPesanan.length === 0) {
    userRiwayatContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada riwayat pesanan.</p>';
    return;
  }

  const visible = applyFiltersAndSort(riwayatPesanan);

  const ordersHtml = visible.map((order, idx) => {
    const itemsHtml = (order.items || []).map(item => `
      <div class="flex items-center justify-between gap-3 py-2 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <img src="${item.gambar || ''}" alt="${item.nama || ''}" class="w-14 h-14 object-cover rounded-lg">
          <div>
            <p class="font-semibold text-gray-900">${item.nama || ''} <span class="text-sm text-gray-500">x${item.qty || 1}</span></p>
            <p class="text-sm text-gray-500">Rp ${formatPrice(item.harga || 0)} ${item.satuan ? '/ ' + item.satuan : ''}</p>
          </div>
        </div>
        <p class="text-sm font-bold text-gray-900">Rp ${formatPrice((item.harga || 0) * (item.qty || 1))}</p>
      </div>
    `).join('');

    const thumbnailsHtml = (order.items || []).slice(0,6).map(i => `
      <img src="${i.gambar || ''}" alt="${i.nama || ''}" title="${i.nama || ''}" class="w-10 h-10 object-cover rounded-md" />
    `).join('');

    const orderId = order.id || (idx + 1);
    const dateStr = order.date ? new Date(order.date).toLocaleString('id-ID') : '-';

    return `
      <article class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" data-id="${orderId}">
        <div class="md:flex md:items-start md:justify-between md:gap-6 mb-4">
          <div class="flex items-start gap-4 md:flex-1">
            ${order.image ? `<img src="${order.image}" alt="order-${orderId}" class="w-24 h-24 object-cover rounded-lg" />` : `<div class="w-24 h-24 rounded-lg bg-gray-50 flex items-center justify-center text-sm text-gray-400">No Image</div>`}
            <div>
              <h2 class="text-lg font-bold text-gray-900">Pesanan #${orderId}</h2>
              <p class="text-sm text-gray-500">${dateStr}</p>
              <div class="mt-3 flex items-center gap-3">
                <div class="flex items-center gap-2">${thumbnailsHtml}</div>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <span class="inline-block rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">${order.status || 'Selesai'}</span>
                <span class="text-sm text-gray-600">Total: <span class="font-bold text-emerald-600">Rp ${formatPrice(order.total || 0)}</span></span>
              </div>
              <p class="mt-2 text-sm text-gray-600">Metode: <span class="font-semibold text-gray-800">${order.paymentMethod || '-'}</span></p>
            </div>
          </div>

          <div class="mt-4 md:mt-0 md:flex md:flex-col md:items-end gap-3">
            <div class="flex items-center gap-2">
              <button class="view-image inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700" data-id="${orderId}">${order.image ? 'Lihat Foto' : 'Tidak ada foto'}</button>
              <button class="toggle-detail inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">Lihat Detail</button>
            </div>
            <button class="repeat-order text-sm text-emerald-600 underline" data-id="${orderId}">Ulangi Pesanan</button>
          </div>
        </div>

        <div class="order-details hidden rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          ${itemsHtml}
        </div>
      </article>
    `;
  }).join('');

  userRiwayatContainer.innerHTML = ordersHtml;

  document.querySelectorAll('.toggle-detail').forEach(btn => btn.addEventListener('click', toggleDetails));
  document.querySelectorAll('.view-image').forEach(btn => btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const order = riwayatState.allOrders.find(o => String(o.id) === String(id));
    if (!order || !order.image) return;
    const modal = document.getElementById('riwayat-image-modal');
    const modalImg = document.getElementById('riwayat-modal-img');
    if (modal && modalImg) {
      modalImg.src = order.image;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }));

  document.querySelectorAll('.repeat-order').forEach(btn => btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const order = riwayatState.allOrders.find(o => String(o.id) === String(id));
    if (!order) return;
    // Save items to checkoutCart and go to cart page
    localStorage.setItem('checkoutCart', JSON.stringify(order.items || []));
    window.location.href = 'cart.html';
  }));

  // modal close
  const modalClose = document.getElementById('riwayat-modal-close');
  const modalRoot = document.getElementById('riwayat-image-modal');
  if (modalClose && modalRoot) {
    modalClose.addEventListener('click', () => {
      modalRoot.classList.add('hidden');
      modalRoot.classList.remove('flex');
      const modalImg = document.getElementById('riwayat-modal-img');
      if (modalImg) modalImg.src = '';
    });
    modalRoot.addEventListener('click', (ev) => {
      if (ev.target === modalRoot) {
        modalRoot.classList.add('hidden');
        modalRoot.classList.remove('flex');
        const modalImg = document.getElementById('riwayat-modal-img');
        if (modalImg) modalImg.src = '';
      }
    });
  }
}

loadRiwayat();
renderRiwayat();