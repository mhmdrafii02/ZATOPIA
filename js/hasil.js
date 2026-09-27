/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/hasil.js
   Halaman Hasil Belajar. Membaca data dari localStorage
   (nama, avatar, hasil evaluasi, skor Arena Game) lalu
   menampilkan skor akhir, rincian, dan pesan feedback.
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
  document.getElementById("hasil-nama").textContent = namaTampil;

  var sapaAwal = temanTeks.getAttribute("data-sapa-awal");
  temanTeks.textContent = sapaAwal + ", " + namaTampil + "!";

  /* ---------- Ambil hasil evaluasi ---------- */
  var hasil = ZatopiaEvaluasi.ambilHasil();

  var elSkorAngka = document.getElementById("hasil-skor-angka");
  var elBenar = document.getElementById("hasil-benar");
  var elSalah = document.getElementById("hasil-salah");
  var elPesan = document.getElementById("hasil-pesan");

  var skor100 = 0;
  var jumlahBenar = 0;
  var jumlahSalah = 0;

  if (hasil && typeof hasil.total === "number" && hasil.total > 0) {
    jumlahBenar = hasil.benar || 0;
    jumlahSalah = hasil.total - jumlahBenar;
    skor100 = Math.round((jumlahBenar / hasil.total) * 100);
  }

  elSkorAngka.textContent = skor100;
  elBenar.textContent = jumlahBenar;
  elSalah.textContent = jumlahSalah;

  /* ---------- Pesan feedback berdasarkan skor ---------- */
  var pesan;
  if (!hasil) {
    pesan =
      "Sepertinya kamu belum mengerjakan Misi Akhir. Yuk kembali ke peta dan coba dulu!";
  } else if (skor100 >= 90) {
    pesan =
      "🌟 Luar biasa! " +
      namaTampil +
      " benar-benar menguasai materi wujud dan perubahan zat.";
  } else if (skor100 >= 70) {
    pesan = "🎉 Hebat! Kamu sudah menyelesaikan Misi ZATOPIA dengan baik.";
  } else if (skor100 >= 50) {
    pesan =
      "👍 Kerja bagus! Coba pelajari lagi beberapa bagian supaya makin mantap.";
  } else {
    pesan =
      "💪 Jangan menyerah! Kunjungi lagi lokasi di peta untuk belajar sekali lagi, ya.";
  }
  elPesan.textContent = pesan;

  /* ---------- Skor Arena Game (kalau siswa pernah bermain) ---------- */
  var skorGame = ZatopiaStorage.ambil("skor", null);
  if (
    skorGame &&
    typeof skorGame === "object" &&
    (skorGame.benar > 0 || skorGame.salah > 0)
  ) {
    document.getElementById("bagian-skor-game").hidden = false;
    document.getElementById("game-benar").textContent = skorGame.benar || 0;
    document.getElementById("game-salah").textContent = skorGame.salah || 0;
  }

  /* ---------- Tombol "Lihat Penghargaan" ----------
     Halaman Penghargaan dibuat di langkah selanjutnya.
     Cek dulu apakah halamannya sudah ada, supaya siswa
     tidak melihat halaman error. */
  function periksaHalaman(alamat) {
    return fetch(alamat, { method: "HEAD" })
      .then(function (respon) {
        return respon.ok;
      })
      .catch(function () {
        return null;
      });
  }

  document.querySelectorAll("a[data-cek-halaman]").forEach(function (link) {
    link.addEventListener("click", function (event) {
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

      var alamat = link.getAttribute("href");
      var namaHalaman = link.getAttribute("data-nama");

      periksaHalaman(alamat).then(function (ada) {
        if (ada === false) {
          ZatopiaToast(
            "Halaman " +
              namaHalaman +
              " sedang disiapkan. Tunggu ya, Penjelajah!",
          );
        } else {
          window.location.href = alamat;
        }
      });
    });
  });
});
