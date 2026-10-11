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
  /* ---------- 0. Pop-up Tujuan Pembelajaran ----------
     Muncul saat siswa masuk ke Peta ZATOPIA. Ditaruh paling atas
     supaya tetap berfungsi walaupun bagian lain bermasalah.
     TP_SEKALI_PER_SESI = true  -> muncul sekali per sesi browser
                                   (tidak muncul lagi tiap kembali dari materi)
     TP_SEKALI_PER_SESI = false -> muncul setiap kali Peta dibuka */
  var TP_SEKALI_PER_SESI = true;

  var tpOverlay = document.getElementById("tp-overlay");
  var tpMulai = document.getElementById("tp-mulai");
  var tpKembali = document.getElementById("tp-kembali");
  var tpTerbuka = false;

  var tpLatar = [
    document.querySelector("header.navbar"),
    document.querySelector("main"),
    document.querySelector("footer.footer"),
  ];

  function kunciLatar(kunci) {
    tpLatar.forEach(function (elemen) {
      if (!elemen) {
        return;
      }
      if (kunci) {
        elemen.setAttribute("inert", "");
      } else {
        elemen.removeAttribute("inert");
      }
    });
  }

  function bukaTujuan() {
    tpTerbuka = true;
    tpOverlay.classList.remove("menutup");
    tpOverlay.hidden = false;
    document.body.classList.add("tp-terbuka");
    kunciLatar(true);
    tpMulai.focus();
  }

  function tutupTujuan() {
    if (!tpTerbuka) {
      return;
    }
    tpTerbuka = false;
    try {
      sessionStorage.setItem("zatopia_tujuan_dilihat", "1");
    } catch (galat) {
      // abaikan
    }
    tpOverlay.classList.add("menutup"); // animasi keluar
    kunciLatar(false);
    document.body.classList.remove("tp-terbuka");
    setTimeout(function () {
      tpOverlay.hidden = true;
      tpOverlay.classList.remove("menutup");
    }, 300);
  }

  tpMulai.addEventListener("click", tutupTujuan);

  // Escape menutup pop-up. Tab berputar di antara dua tombol saja.
  document.addEventListener("keydown", function (event) {
    if (!tpTerbuka) {
      return;
    }
    if (event.key === "Escape") {
      tutupTujuan();
    } else if (event.key === "Tab") {
      if (event.shiftKey && document.activeElement === tpMulai) {
        event.preventDefault();
        tpKembali.focus();
      } else if (!event.shiftKey && document.activeElement === tpKembali) {
        event.preventDefault();
        tpMulai.focus();
      }
    }
  });

  var tpSudahDilihat = false;
  try {
    tpSudahDilihat = sessionStorage.getItem("zatopia_tujuan_dilihat") === "1";
  } catch (galat) {
    tpSudahDilihat = false;
  }

  if (TP_SEKALI_PER_SESI && tpSudahDilihat) {
    tpOverlay.hidden = true;
  } else {
    bukaTujuan();
  }

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
