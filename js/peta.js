/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/peta.js
   Halaman 3: Peta ZATOPIA.
   Tugas:
   1. Menampilkan sapaan dengan nama siswa (dari localStorage)
   2. Menampilkan avatar siswa
   3. Menampilkan progress petualangan dan tanda lokasi selesai
   4. Menandai lokasi berikutnya + memindahkan penanda karakter
   5. Menangani klik lokasi (aman untuk halaman yang belum dibuat)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Elemen di halaman ---------- */
  var petaIsi = document.getElementById("peta-isi");
  var sapaanTeks = document.getElementById("sapaan-teks");
  var tautanIsiNama = document.getElementById("tautan-isi-nama");

  var progressAngka = document.getElementById("progress-angka");
  var progressBar = document.getElementById("progress-bar");
  var progressIsi = document.getElementById("progress-isi");
  var progressInfo = document.getElementById("progress-info");

  var pion = document.getElementById("pion");
  var daftarLokasi = document.querySelectorAll(".lokasi");

  /* ---------- 1. Data siswa dari localStorage ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var avatar = ZatopiaStorage.ambil("avatar", "");

  // Jika belum memilih avatar, pakai Zaki sebagai cadangan
  if (avatar !== "zaki" && avatar !== "zara") {
    avatar = "zaki";
  }

  // Sapaan dinamis (textContent = aman, nama tidak dibaca sebagai kode HTML)
  if (typeof nama === "string" && nama !== "") {
    sapaanTeks.textContent =
      "Halo, " + nama + "! Siap melanjutkan petualangan?";
  } else {
    sapaanTeks.textContent = "Halo, Penjelajah! Siap memulai petualangan?";
    tautanIsiNama.hidden = false; // tampilkan link ke halaman Identitas
  }

  /* ---------- 2. Avatar siswa ---------- */
  var dataAvatar = {
    zaki: {
      emoji: "👦",
      gambar: "../assets/images/karakter/zaki.png",
      nama: "Zaki",
    },
    zara: {
      emoji: "👧",
      gambar: "../assets/images/karakter/zara.png",
      nama: "Zara",
    },
  };
  var pilihan = dataAvatar[avatar];

  petaIsi.setAttribute("data-avatar", avatar); // mengubah warna avatar (ungu / biru)

  document.getElementById("emoji-sapaan").textContent = pilihan.emoji;
  document.getElementById("emoji-pion").textContent = pilihan.emoji;

  // Gambar Canva dipasang di sini. Jika file belum ada, emoji tetap tampil.
  var gambarSapaan = document.getElementById("avatar-sapaan");
  var gambarPion = document.getElementById("avatar-pion");
  gambarSapaan.alt = pilihan.nama;
  gambarSapaan.src = pilihan.gambar;
  gambarPion.src = pilihan.gambar;

  /* ---------- 3. Progress petualangan ---------- */
  var persen = ZatopiaProgress.hitungPersen();
  var selesai = ZatopiaProgress.jumlahSelesai();
  var total = ZatopiaProgress.LOKASI.length;

  progressAngka.textContent = persen + "%";
  progressBar.setAttribute("aria-valuenow", persen);
  progressIsi.style.width = persen + "%";
  progressInfo.textContent = selesai + " dari " + total + " lokasi selesai";

  if (selesai === total) {
    progressInfo.textContent = "🎉 Hebat! Semua lokasi sudah kamu jelajahi.";
  }

  /* ---------- 4. Tanda lokasi selesai, lokasi berikutnya, dan karakter ---------- */
  var lokasiBerikutnya = null; // lokasi pertama yang belum selesai
  var lokasiTerakhir = null;

  daftarLokasi.forEach(function (lokasi) {
    var kode = lokasi.getAttribute("data-id");
    var namaLokasi = lokasi.getAttribute("data-nama");
    lokasiTerakhir = lokasi;

    if (ZatopiaProgress.sudahSelesai(kode)) {
      lokasi.classList.add("selesai");
      lokasi.setAttribute("aria-label", namaLokasi + ", sudah selesai");
    } else if (lokasiBerikutnya === null) {
      lokasiBerikutnya = lokasi;
    }
  });

  if (lokasiBerikutnya !== null) {
    // Tanda kuning di atas ikon: "Mulai di sini!" atau "Lanjut ke sini!"
    var tanda = selesai === 0 ? "Mulai di sini!" : "Lanjut ke sini!";
    lokasiBerikutnya.classList.add("berikutnya");
    lokasiBerikutnya.setAttribute("data-tanda", tanda);
  }

  // Pindahkan karakter ke lokasi berikutnya (atau lokasi terakhir jika semua selesai)
  var tempatPion = lokasiBerikutnya || lokasiTerakhir;
  if (tempatPion) {
    tempatPion.appendChild(pion);
    pion.hidden = false;
  }

  /* ---------- 5. Klik lokasi ----------
     Halaman tujuan (misalnya dunia-padat.html) dibuat di halaman berikutnya.
     Supaya siswa tidak melihat halaman error, kode ini memeriksa dulu apakah
     halamannya ada:
       - Ada        -> langsung pindah halaman
       - Belum ada  -> tampilkan pesan singkat
     Setelah halamannya dibuat, tidak ada yang perlu diubah di sini. */

  // Mengembalikan true (ada), false (tidak ada), atau null (tidak bisa diperiksa)
  function periksaHalaman(alamat) {
    return fetch(alamat, { method: "HEAD" })
      .then(function (respon) {
        return respon.ok;
      })
      .catch(function () {
        return null;
      });
  }

  daftarLokasi.forEach(function (lokasi) {
    lokasi.addEventListener("click", function (event) {
      // Biarkan klik khusus (Ctrl/Cmd + klik, klik tengah) berjalan normal
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();

      var alamat = lokasi.getAttribute("href");
      var namaLokasi = lokasi.getAttribute("data-nama");

      periksaHalaman(alamat).then(function (ada) {
        if (ada === false) {
          ZatopiaToast(
            "Lokasi " + namaLokasi + " sedang dibangun. Tunggu ya, Penjelajah!",
          );
        } else {
          // Halaman ada, atau tidak bisa diperiksa (misalnya tanpa Live Server): tetap pindah
          window.location.href = alamat;
        }
      });
    });
  });
});
