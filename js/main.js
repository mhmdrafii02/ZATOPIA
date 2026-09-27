/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/main.js
   Fungsi umum yang dipakai di halaman Beranda.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------------------------------------------------
     1. GAMBAR KARAKTER (Zaki & Zara)
     Kalau file gambar sudah ada di assets/images/karakter/,
     gambar ditampilkan dan placeholder disembunyikan.
     Kalau belum ada, placeholder tetap terlihat.
     --------------------------------------------------- */
  // .karakter = Beranda, .avatar-kartu = Identitas, [data-karakter] = Peta
  var daftarGambar = document.querySelectorAll(
    ".karakter img, .avatar-kartu img, [data-karakter] img",
  );

  daftarGambar.forEach(function (gambar) {
    var kotak = gambar.closest(".karakter, .avatar-kartu, [data-karakter]");

    function tandaiAda() {
      kotak.classList.add("ada-gambar");
    }

    // Gambar sudah termuat (misalnya dari cache)
    if (gambar.complete && gambar.naturalWidth > 0) {
      tandaiAda();
    } else {
      // Gambar baru termuat setelah beberapa saat
      gambar.addEventListener("load", tandaiAda);
    }
  });

  /* ---------------------------------------------------
     2. LINK HALAMAN YANG BELUM DIBUAT
     Link yang punya atribut data-placeholder tidak pindah halaman,
     tetapi menampilkan pesan singkat supaya tidak ada halaman error.
     Setelah halamannya dibuat, hapus atribut data-placeholder
     di index.html, maka link langsung berfungsi.
     --------------------------------------------------- */
  var toast = document.getElementById("toast");
  var timerToast;

  function tampilkanPesan(teks) {
    toast.textContent = teks;
    toast.classList.add("tampil");

    // Sembunyikan otomatis setelah 3 detik
    clearTimeout(timerToast);
    timerToast = setTimeout(function () {
      toast.classList.remove("tampil");
    }, 3000);
  }

  // Dibuka agar halaman lain (misalnya peta.js) bisa memakai pesan singkat yang sama
  window.ZatopiaToast = tampilkanPesan;

  var linkPlaceholder = document.querySelectorAll("a[data-placeholder]");

  linkPlaceholder.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // batalkan perpindahan halaman
      var namaHalaman = link.getAttribute("data-placeholder");
      tampilkanPesan(
        "Halaman " + namaHalaman + " sedang disiapkan. Tunggu ya, Penjelajah!",
      );
    });
  });
});
