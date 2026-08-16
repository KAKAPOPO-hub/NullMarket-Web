function getStoredCart() {
      const raw = localStorage.getItem('cart');
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }

    function getCart() {
      const rawCheckout = localStorage.getItem('checkoutCart');
      if (!rawCheckout) {
        return getStoredCart();
      }
      try {
        return JSON.parse(rawCheckout);
      } catch {
        return getStoredCart();
      }
    }

    function clearCheckoutCart() {
      localStorage.removeItem('checkoutCart');
      localStorage.removeItem('selectedCartIds');
    }

    function formatPrice(value) {
      return value.toLocaleString('id-ID');
    }

    function renderPaymentSummary() {
      const summaryEl = document.getElementById('payment-summary');
      const cart = getCart();
      const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

      if (!summaryEl) return;

      if (cart.length === 0) {
        summaryEl.innerHTML = `
          <div class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p class="text-sm font-semibold text-gray-500">Keranjang kosong. Tambahkan produk terlebih dahulu.</p>
            <a href="index.html" class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors mt-4">Kembali Belanja</a>
          </div>
        `;
        return;
      }

      summaryEl.innerHTML = `
        <div class="space-y-3">
          <div class="flex justify-between text-sm text-gray-500">
            <span>Jumlah produk</span>
            <span>${cart.length} jenis</span>
          </div>
          <div class="flex justify-between text-sm text-gray-500">
            <span>Total item</span>
            <span>${cart.reduce((sum, item) => sum + item.qty, 0)} buah</span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-gray-900">
            <span>Total bayar</span>
            <span>Rp ${formatPrice(total)}</span>
          </div>
        </div>
        <div class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 mt-4">
          Pastikan data pengirim sudah benar sebelum melakukan checkout.
        </div>
      `;
    }

    function handlePaymentSubmit(event) {
      event.preventDefault();
      const cart = getCart();
      if (cart.length === 0) {
        alert('Keranjang kosong. Tambahkan produk terlebih dahulu.');
        return;
      }

      const senderName = document.getElementById('sender-name').value.trim();
      const shippingAddress = document.getElementById('shipping-address').value.trim();
      const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = paymentMethodInput ? paymentMethodInput.value : '';

      if (!senderName || !shippingAddress || !paymentMethod) {
        alert('Lengkapi semua data pengiriman dan pilih metode pembayaran.');
        return;
      }

      const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
      alert(`Checkout berhasil!\nNama Pengirim: ${senderName}\nAlamat: ${shippingAddress}\nMetode: ${paymentMethod}\nTotal: Rp ${formatPrice(total)}`);

      // Simpan ke riwayat pesanan (localStorage)
      try {
        const checkoutRaw = localStorage.getItem('checkoutCart');
        const checkoutItems = checkoutRaw ? JSON.parse(checkoutRaw) : cart;
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : { username: 'guest' };
        const riwayatPesanan = JSON.parse(localStorage.getItem('riwayatPesanan') || '[]');
        const order = {
          id: Date.now(),
          user: user.username || user.email || 'guest',
          items: checkoutItems,
          total,
          date: new Date().toISOString(),
          senderName,
          shippingAddress,
          paymentMethod,
          image: (checkoutItems && checkoutItems.length > 0) ? checkoutItems[0].gambar : null
        };
        riwayatPesanan.push(order);
        localStorage.setItem('riwayatPesanan', JSON.stringify(riwayatPesanan));

        
        const storedCart = getStoredCart();
        const checkoutIds = new Set(checkoutItems.map(item => item.id));
        const updatedCart = storedCart.filter(item => !checkoutIds.has(item.id));
        localStorage.setItem('cart', JSON.stringify(updatedCart));

      } catch (e) {
        console.error('Gagal menyimpan riwayat pesanan', e);
      }

      clearCheckoutCart();
      window.location.href = 'home.html';
    }

    window.addEventListener('DOMContentLoaded', () => {
      renderPaymentSummary();
      const form = document.getElementById('payment-form');
      if (form) {
        form.addEventListener('submit', handlePaymentSubmit);
      }
    });