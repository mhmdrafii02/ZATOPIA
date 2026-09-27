/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/penghargaan.js
   Halaman Balai Penghargaan. Menentukan badge berdasarkan
   skor evaluasi terakhir siswa, lalu menampilkan badge
   besar, gelar, dan pesan motivasi.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var halaman = document.getElementById("halaman-materi");
  var temanTeks = document.getElementById("teman-teks");

  /* ---------- Data siswa: nama dan avatar ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var avatar = ZatopiaStorage.ambil("avatar", "");
  if (avatar !== "zaki" && avatar !== "zara") {
    avatar = "zaki";
  }

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
  var pilihanAvatar = dataAvatar[avatar];
  halaman.setAttribute("data-avatar", avatar);
  document.getElementById("emoji-teman").textContent = pilihanAvatar.emoji;
  var gambarTeman = document.getElementById("avatar-teman");
  gambarTeman.alt = pilihanAvatar.nama;
  gambarTeman.src = pilihanAvatar.gambar;

  var namaTampil =
    typeof nama === "string" && nama !== "" ? nama : "Penjelajah ZATOPIA";
  document.getElementById("badge-nama").textContent = namaTampil;
  temanTeks.textContent = "Ini penghargaan buat kamu, " + namaTampil + "!";

  /* ---------- Ambil skor evaluasi ---------- */
  var hasil = ZatopiaEvaluasi.ambilHasil();
  var skor100 = 0;
  if (hasil && typeof hasil.total === "number" && hasil.total > 0) {
    skor100 = Math.round(((hasil.benar || 0) / hasil.total) * 100);
  }
  document.getElementById("badge-skor").textContent =
    "Skor: " + skor100 + " / 100";

  /* ---------- Tentukan badge berdasarkan skor ---------- */
  var DAFTAR_BADGE = [
    {
      min: 90,
      emoji: "🏆",
      gelar: "Master ZATOPIA",
      motivasi:
        "Kamu benar-benar menguasai wujud zat dan perubahannya. Luar biasa!",
    },
    {
      min: 80,
      emoji: "🥇",
      gelar: "Ahli Perubahan Wujud",
      motivasi: "Pemahamanmu tentang perubahan wujud zat sangat bagus!",
    },
    {
      min: 70,
      emoji: "🥈",
      gelar: "Detektif Zat",
      motivasi: "Kerja bagus! Kamu sudah mengenali banyak perubahan zat.",
    },
    {
      min: 0,
      emoji: "🥉",
      gelar: "Penjelajah Pemula",
      motivasi: "Terus semangat belajar, ya! Coba jelajahi lagi peta ZATOPIA.",
    },
  ];

  var badge = DAFTAR_BADGE[DAFTAR_BADGE.length - 1];
  for (var i = 0; i < DAFTAR_BADGE.length; i++) {
    if (skor100 >= DAFTAR_BADGE[i].min) {
      badge = DAFTAR_BADGE[i];
      break;
    }
  }

  document.getElementById("badge-emoji").textContent = badge.emoji;
  document.getElementById("badge-gelar").textContent = badge.gelar;
  document.getElementById("badge-motivasi").textContent = badge.motivasi;

  /* ---------- Tombol "Ulangi Petualangan" ----------
     Menghapus progress, skor game, dan hasil evaluasi,
     lalu kembali ke peta supaya siswa bisa mulai lagi
     dari awal. Nama dan avatar tetap disimpan. */
  document
    .getElementById("tombol-ulangi")
    .addEventListener("click", function () {
      ZatopiaProgress.reset();
      ZatopiaSkor.reset();
      ZatopiaEvaluasi.reset();
      ZatopiaStorage.hapus("hutanZatCompleted");
      window.location.href = "peta.html";
    });
});
