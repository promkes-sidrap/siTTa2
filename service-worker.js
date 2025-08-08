const CACHE_NAME = 'imunisasi-tt-cache-v1.0.3'; // Ubah versi setiap kali Anda memodifikasi aset
const urlsToCache = [
  // Pastikan jalur ini benar relatif terhadap root aplikasi
  '/', // Meng-cache root URL, yang akan mengarah ke index.html
  '/index.html', // Halaman HTML utama Anda
  '/manifest.json',
  '/service-worker.js', // Service Worker itu sendiri

  // Aset CSS dan JS eksternal (CDN) yang Anda gunakan
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',

  // Folder Ikon Anda
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',

  // Jika Anda punya file JS lokal terpisah selain yang di HTML
  // Contoh: '/js/script_utama.js',
  // Jika Anda punya file CSS lokal terpisah selain yang di HTML
  // Contoh: '/css/main.css',

  // Tambahkan semua aset lain yang penting untuk fungsi offline di sini
  // Misalnya gambar latar belakang, font lokal, dll.
];

// Event 'install': Dipicu saat Service Worker pertama kali diinstal
self.addEventListener('install', event => {
  console.log('[Service Worker] Menginstal...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache dibuka, menambahkan URL ke cache:', urlsToCache);
        return cache.addAll(urlsToCache).catch(error => {
            console.error('[Service Worker] Gagal meng-cache URL:', error);
        });
      })
  );
});

// Event 'fetch': Dipicu setiap kali browser membuat permintaan jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, sajikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, coba ambil dari jaringan
        return fetch(event.request).catch(error => {
            console.error('[Service Worker] Gagal mengambil dari jaringan:', error);
            // Di sini Anda bisa mengembalikan halaman offline khusus jika ada
            // atau aset fallback lainnya jika permintaan gagal (misalnya saat offline)
        });
      })
  );
});

// Event 'activate': Dipicu saat Service Worker baru mengambil alih kendali
self.addEventListener('activate', event => {
  console.log('[Service Worker] Mengaktifkan...');
  // Bersihkan cache lama
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('[Service Worker] Aktif dan siap melayani.');
  // Ini penting agar Service Worker mengklaim semua klien terbuka segera
  return self.clients.claim();
});
