/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/materi.js
   Dipakai halaman materi: Dunia Padat (Halaman 4),
   dan nanti Dunia Cair serta Dunia Gas.
   Tugas:
   1. Menyapa siswa dengan nama + menampilkan avatar teman belajar
   2. Menjalankan aktivitas "pilih benda" dengan umpan balik langsung
   3. Menyimpan progress ke localStorage setelah aktivitas selesai
   4. Menangani tombol "Materi berikutnya" (aman jika halaman belum ada)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Elemen di halaman ---------- */
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // contoh: "gunung-es"

  var temanTeks = document.getElementById("teman-teks");

  var aktivitas = document.getElementById("aktivitas");
  var daftarBenda = document.getElementById("daftar-benda");
  var hitungTemuan = document.getElementById("hitung-temuan");
  var umpanBalik = document.getElementById("umpan-balik");
  var kotakSelesai = document.getElementById("kotak-selesai");
  var selesaiInfo = document.getElementById("selesai-info");
  var tombolUlang = document.getElementById("tombol-ulang");
  var tombolBerikutnya = document.getElementById("tombol-berikutnya");
  var lencanaSelesai = document.getElementById("lencana-selesai");

  /* ---------- 1. Data siswa: nama dan avatar ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var avatar = ZatopiaStorage.ambil("avatar", "");
  if (avatar !== "zaki" && avatar !== "zara") {
    avatar = "zaki"; // cadangan jika belum memilih avatar
  }

  // Sapaan dari teman belajar (textContent = aman)
  var sapaAwal = temanTeks.getAttribute("data-sapa-awal");
  if (typeof nama === "string" && nama !== "") {
    temanTeks.textContent = sapaAwal + ", " + nama + "!";
  } else {
    temanTeks.textContent = sapaAwal + "!";
  }

  // Avatar teman. Gambar Canva dipasang di sini; jika file belum ada, emoji tetap tampil.
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

  halaman.setAttribute("data-avatar", avatar);
  document.getElementById("emoji-teman").textContent = pilihan.emoji;
  var gambarTeman = document.getElementById("avatar-teman");
  gambarTeman.alt = pilihan.nama;
  gambarTeman.src = pilihan.gambar;

  /* ---------- 2. Aktivitas pilih benda ---------- */
  var pesanBenar = aktivitas.getAttribute("data-pesan-benar");
  var pesanSalah = aktivitas.getAttribute("data-pesan-salah");

  var semuaBenda = Array.prototype.slice.call(
    daftarBenda.querySelectorAll(".benda"),
  );
  var totalBenar = daftarBenda.querySelectorAll(
    '.benda[data-benar="true"]',
  ).length;
  var jumlahDitemukan = 0;

  // Acak urutan benda supaya tidak selalu sama
  function acakBenda() {
    var urutan = semuaBenda.slice();
    for (var i = urutan.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var sementara = urutan[i];
      urutan[i] = urutan[j];
      urutan[j] = sementara;
    }
    urutan.forEach(function (benda) {
      daftarBenda.appendChild(benda); // memindahkan sesuai urutan baru
    });
  }

  function perbaruiHitungan() {
    hitungTemuan.textContent =
      "Ditemukan: " + jumlahDitemukan + " dari " + totalBenar;
  }

  // Tampilkan umpan balik. jenis: "benar" atau "salah"
  function tampilkanUmpanBalik(teks, jenis) {
    umpanBalik.textContent = teks;
    umpanBalik.className = "umpan-balik umpan-" + jenis + " baru";

    // Jika pesan berada di luar layar, gulirkan pelan agar terlihat
    var kotak = umpanBalik.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      umpanBalik.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function pilihBenda(benda) {
    // Benda yang sudah dipilih tidak bisa dipilih lagi
    if (benda.getAttribute("aria-disabled") === "true") {
      return;
    }

    var namaBenda = benda.getAttribute("data-nama");
    var benar = benda.getAttribute("data-benar") === "true";

    benda.setAttribute("aria-disabled", "true");

    if (benar) {
      benda.classList.add("benar");
      benda.setAttribute(
        "aria-label",
        namaBenda + ", benar, termasuk zat padat",
      );
      jumlahDitemukan++;
      perbaruiHitungan();
      tampilkanUmpanBalik(pesanBenar, "benar");

      if (jumlahDitemukan === totalBenar) {
        selesaikanAktivitas();
      }
    } else {
      benda.classList.add("salah");
      benda.setAttribute("aria-label", namaBenda + ", belum tepat");
      tampilkanUmpanBalik(pesanSalah, "salah");
    }
  }

  // Semua zat padat sudah ditemukan
  function selesaikanAktivitas() {
    // Benda yang belum dipilih diredupkan dan dikunci
    semuaBenda.forEach(function (benda) {
      if (benda.getAttribute("aria-disabled") !== "true") {
        benda.setAttribute("aria-disabled", "true");
        benda.classList.add("bukan");
      }
    });

    // Simpan progress ke localStorage (lewat js/storage.js)
    var berhasil = ZatopiaProgress.tandaiSelesai(kodeLokasi);
    if (berhasil) {
      selesaiInfo.textContent = "Progress petualanganmu sudah disimpan.";
    } else {
      selesaiInfo.textContent =
        "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";
    }

    kotakSelesai.hidden = false;
    lencanaSelesai.hidden = false;
    tombolBerikutnya.classList.add("menyala"); // tombol berikutnya berdenyut pelan

    kotakSelesai.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Main lagi: kembalikan aktivitas ke awal (progress yang sudah tersimpan tetap)
  function mulaiUlang() {
    jumlahDitemukan = 0;
    semuaBenda.forEach(function (benda) {
      benda.classList.remove("benar", "salah", "bukan");
      benda.removeAttribute("aria-disabled");
      benda.setAttribute("aria-label", benda.getAttribute("data-nama"));
    });
    umpanBalik.textContent = "";
    umpanBalik.className = "umpan-balik";
    kotakSelesai.hidden = true;
    tombolBerikutnya.classList.remove("menyala");
    perbaruiHitungan();
    acakBenda();
    hitungTemuan.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  semuaBenda.forEach(function (benda) {
    benda.setAttribute("aria-label", benda.getAttribute("data-nama"));
    benda.addEventListener("click", function () {
      pilihBenda(benda);
    });
  });
  tombolUlang.addEventListener("click", mulaiUlang);

  // Keadaan awal
  acakBenda();
  perbaruiHitungan();

  // Jika misi ini pernah diselesaikan, tampilkan lencana "Sudah selesai"
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    lencanaSelesai.hidden = false;
  }

  /* ---------- 3. Tombol "Materi berikutnya" ----------
     Halaman berikutnya (Dunia Cair) dibuat di langkah selanjutnya.
     Supaya siswa tidak melihat halaman error, kode ini memeriksa dulu
     apakah halamannya ada:
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

  var linkCek = document.querySelectorAll("a[data-cek-halaman]");

  linkCek.forEach(function (link) {
    link.addEventListener("click", function (event) {
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
          window.location.href = alamat; // ada, atau tidak bisa diperiksa: tetap pindah
        }
      });
    });
  });
});
