/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/dunia-cair.js
   Halaman 6: Dunia Cair.
   Tugas:
   1. Menyapa siswa dengan nama + menampilkan avatar teman belajar
   2. Simulasi wadah: klik gelas/mangkuk/botol, air berpindah bentuk
   3. Kuis pilihan ganda dengan umpan balik langsung
   4. Menyimpan progress ke localStorage setelah kuis dijawab benar
   5. Menangani tombol "Materi berikutnya" (aman jika halaman belum ada)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Elemen di halaman ---------- */
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "danau-cair"

  var temanTeks = document.getElementById("teman-teks");

  var tombolBerikutnya = document.getElementById("tombol-berikutnya");
  var lencanaSelesai = document.getElementById("lencana-selesai");

  /* ---------- 1. Data siswa: nama dan avatar (sama seperti Dunia Padat) ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var avatar = ZatopiaStorage.ambil("avatar", "");
  if (avatar !== "zaki" && avatar !== "zara") {
    avatar = "zaki"; // cadangan jika belum memilih avatar
  }

  var sapaAwal = temanTeks.getAttribute("data-sapa-awal");
  if (typeof nama === "string" && nama !== "") {
    temanTeks.textContent = sapaAwal + ", " + nama + "!";
  } else {
    temanTeks.textContent = sapaAwal + "!";
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
  var pilihan = dataAvatar[avatar];

  halaman.setAttribute("data-avatar", avatar);
  document.getElementById("emoji-teman").textContent = pilihan.emoji;
  var gambarTeman = document.getElementById("avatar-teman");
  gambarTeman.alt = pilihan.nama;
  gambarTeman.src = pilihan.gambar;

  /* ---------- 2. Simulasi wadah ---------- */
  var tombolWadah = document.querySelectorAll(".wadah-tombol");
  var panggungKosong = document.getElementById("panggung-kosong");
  var kotakTuang = document.getElementById("tuang");
  var semuaWadahSvg = {
    gelas: document.getElementById("wadah-gelas"),
    mangkuk: document.getElementById("wadah-mangkuk"),
    botol: document.getElementById("wadah-botol"),
  };
  var wadahAktif = null;

  function pilihWadah(namaWadah) {
    if (wadahAktif === namaWadah) {
      return; // wadah yang sama, tidak perlu dituang ulang
    }

    // Kalau sebelumnya sudah ada wadah aktif, mainkan animasi "menuang"
    if (wadahAktif !== null) {
      kotakTuang.classList.remove("menuang");
      void kotakTuang.offsetWidth; // memulai ulang animasi
      kotakTuang.classList.add("menuang");
    }

    wadahAktif = namaWadah;
    panggungKosong.hidden = true;

    // Sembunyikan semua wadah, tampilkan yang dipilih.
    // Catatan: elemen <svg> tidak selalu mengikuti properti .hidden seperti
    // elemen HTML biasa, jadi atribut hidden diatur langsung supaya pasti berhasil.
    Object.keys(semuaWadahSvg).forEach(function (kunci) {
      if (kunci === namaWadah) {
        semuaWadahSvg[kunci].removeAttribute("hidden");
      } else {
        semuaWadahSvg[kunci].setAttribute("hidden", "");
      }
    });

    // Tandai tombol yang sedang aktif
    tombolWadah.forEach(function (tombol) {
      var aktif = tombol.getAttribute("data-wadah") === namaWadah;
      tombol.setAttribute("aria-pressed", aktif ? "true" : "false");
    });
  }

  tombolWadah.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      pilihWadah(tombol.getAttribute("data-wadah"));
    });
  });

  /* ---------- 3. Kuis pilihan ganda ---------- */
  var areaKuis = document.getElementById("aktivitas-kuis");
  var pesanBenar = areaKuis.getAttribute("data-pesan-benar");
  var pesanSalahA = areaKuis.getAttribute("data-pesan-salah-a"); // "Tetap sama"
  var pesanSalahC = areaKuis.getAttribute("data-pesan-salah-c"); // "Menghilang"

  var daftarOpsi = document.querySelectorAll(".opsi-kuis");
  var umpanBalik = document.getElementById("umpan-balik");
  var kotakSelesai = document.getElementById("kotak-selesai");
  var selesaiInfo = document.getElementById("selesai-info");

  var sudahBenar = false;

  function tampilkanUmpanBalik(teks, jenis) {
    umpanBalik.textContent = teks;
    umpanBalik.className = "umpan-balik umpan-" + jenis + " baru";

    var kotak = umpanBalik.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      umpanBalik.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function selesaikanKuis() {
    sudahBenar = true;

    // Kunci semua opsi setelah jawaban benar ditemukan
    daftarOpsi.forEach(function (opsi) {
      opsi.setAttribute("aria-disabled", "true");
    });

    var berhasil = ZatopiaProgress.tandaiSelesai(kodeLokasi);
    selesaiInfo.textContent = berhasil
      ? "Progress petualanganmu sudah disimpan."
      : "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";

    kotakSelesai.hidden = false;
    lencanaSelesai.hidden = false;
    tombolBerikutnya.classList.add("menyala"); // tombol berikutnya berdenyut pelan

    kotakSelesai.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  daftarOpsi.forEach(function (opsi) {
    opsi.setAttribute("aria-checked", "false");

    opsi.addEventListener("click", function () {
      if (sudahBenar || opsi.getAttribute("aria-disabled") === "true") {
        return; // sudah terjawab benar, tidak perlu diproses lagi
      }

      var jawaban = opsi.getAttribute("data-jawaban");

      // Bersihkan tanda "salah" pada opsi lain setiap kali mencoba
      daftarOpsi.forEach(function (lain) {
        lain.classList.remove("salah");
        lain.setAttribute("aria-checked", "false");
      });
      opsi.setAttribute("aria-checked", "true");

      if (jawaban === "b") {
        opsi.classList.add("benar");
        tampilkanUmpanBalik(pesanBenar, "benar");
        selesaikanKuis();
      } else {
        opsi.classList.add("salah");
        var pesan = jawaban === "a" ? pesanSalahA : pesanSalahC;
        tampilkanUmpanBalik(pesan, "salah");
      }
    });
  });

  // Jika misi ini pernah diselesaikan sebelumnya, tampilkan lencananya
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    lencanaSelesai.hidden = false;
  }

  /* ---------- 4. Tombol "Materi berikutnya" ----------
     Halaman berikutnya (Dunia Gas) dibuat di langkah selanjutnya.
     Supaya siswa tidak melihat halaman error, kode ini memeriksa dulu
     apakah halamannya ada:
       - Ada        -> langsung pindah halaman
       - Belum ada  -> tampilkan pesan singkat
     Setelah halamannya dibuat, tidak ada yang perlu diubah di sini. */

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
