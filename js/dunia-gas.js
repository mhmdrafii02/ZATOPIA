/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/dunia-gas.js
   Halaman 7: Dunia Gas / Negeri Uap.
   Tugas:
   1. Menyapa siswa dengan nama + menampilkan avatar teman belajar
   2. Menampilkan Progress Petualangan di bagian atas
   3. Animasi balon: tiap klik TIUP, balon membesar selangkah
   4. Setelah balon penuh, tampilkan kuis dengan umpan balik langsung
   5. Menyimpan progress ke localStorage setelah kuis dijawab benar
   6. Menangani tombol "Materi berikutnya" (aman jika halaman belum ada)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Elemen di halaman ---------- */
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "negeri-uap"

  var temanTeks = document.getElementById("teman-teks");
  var tombolBerikutnya = document.getElementById("tombol-berikutnya");
  var lencanaSelesai = document.getElementById("lencana-selesai");

  /* ---------- 1. Data siswa: nama dan avatar (sama seperti halaman lain) ---------- */
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

  /* ---------- 2. Progress Petualangan di hero ---------- */
  var progresAngka = document.getElementById("progres-mini-angka");
  var progresBar = document.getElementById("progres-mini-bar");
  var progresIsi = document.getElementById("progres-mini-isi");

  function tampilkanProgres() {
    var jumlah = ZatopiaProgress.jumlahSelesai();
    var total = ZatopiaProgress.LOKASI.length;
    progresAngka.textContent = jumlah + "/" + total;
    progresBar.setAttribute("aria-valuenow", jumlah);
    progresIsi.style.width = Math.round((jumlah / total) * 100) + "%";
  }
  tampilkanProgres();

  /* ---------- 3. Animasi balon ---------- */
  var LEVEL_MAKS = 5;
  var SKALA_AWAL = 0.55;
  var SKALA_LANGKAH = 0.13; // penambahan skala tiap klik

  var levelBalon = 0;
  var pernahPenuh = false; // begitu true, bagian kuis tetap terlihat

  var balonSvg = document.getElementById("balon-svg");
  var panggungBalon = document.getElementById("panggung-balon");
  var kilau = document.getElementById("kilau");
  var ukuranBalon = document.getElementById("ukuran-balon");
  var tombolTiup = document.getElementById("tombol-tiup");
  var tombolKempiskan = document.getElementById("tombol-kempiskan");
  var bagianKuis = document.getElementById("bagian-kuis");

  var teksUkuran = [
    "Balon masih kempis. Ketuk TIUP!",
    "Balon mulai terisi udara.",
    "Balon semakin besar!",
    "Wah, balon makin mengembang!",
    "Sedikit lagi penuh...",
    "🎈 Balon sudah penuh ditiup!",
  ];

  function skalaUntuk(level) {
    return SKALA_AWAL + level * SKALA_LANGKAH;
  }

  function perbaruiTampilanBalon(skalaSebelum) {
    balonSvg.style.setProperty("--skala-awal", skalaSebelum);
    balonSvg.style.setProperty("--skala", skalaUntuk(levelBalon));
    ukuranBalon.textContent = teksUkuran[levelBalon];

    // Animasi kecil "letupan tiupan" setiap kali balon membesar
    balonSvg.classList.remove("meniup");
    void balonSvg.offsetWidth; // memulai ulang animasi
    balonSvg.classList.add("meniup");
  }

  function tiupBalon() {
    if (levelBalon >= LEVEL_MAKS) {
      return;
    }
    var skalaSebelum = skalaUntuk(levelBalon);
    levelBalon++;
    perbaruiTampilanBalon(skalaSebelum);

    if (levelBalon === LEVEL_MAKS) {
      balonPenuh();
    }
  }

  function balonPenuh() {
    panggungBalon.classList.add("penuh");
    tombolTiup.textContent = "🎈 Balon sudah penuh!";
    tombolTiup.disabled = true;
    tombolKempiskan.hidden = false;

    if (!pernahPenuh) {
      pernahPenuh = true;
      bagianKuis.hidden = false;
      bagianKuis.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function kempiskanBalon() {
    var skalaSebelum = skalaUntuk(levelBalon);
    levelBalon = 0;
    panggungBalon.classList.remove("penuh");
    tombolTiup.textContent = "🎈 TIUP";
    tombolTiup.disabled = false;
    tombolKempiskan.hidden = true;
    perbaruiTampilanBalon(skalaSebelum);
  }

  balonSvg.style.setProperty("--skala-awal", SKALA_AWAL);
  balonSvg.style.setProperty("--skala", SKALA_AWAL);

  tombolTiup.addEventListener("click", tiupBalon);
  tombolKempiskan.addEventListener("click", kempiskanBalon);

  /* ---------- 4. Kuis pilihan ganda ---------- */
  var areaKuis = document.getElementById("aktivitas-kuis");
  var pesanBenar = areaKuis.getAttribute("data-pesan-benar");
  var pesanSalahB = areaKuis.getAttribute("data-pesan-salah-b"); // "Diam saja"
  var pesanSalahC = areaKuis.getAttribute("data-pesan-salah-c"); // "Berubah menjadi cair"

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
    tampilkanProgres(); // perbarui Progress Petualangan di atas

    kotakSelesai.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  daftarOpsi.forEach(function (opsi) {
    opsi.setAttribute("aria-checked", "false");

    opsi.addEventListener("click", function () {
      if (sudahBenar || opsi.getAttribute("aria-disabled") === "true") {
        return;
      }

      var jawaban = opsi.getAttribute("data-jawaban");

      daftarOpsi.forEach(function (lain) {
        lain.classList.remove("salah");
        lain.setAttribute("aria-checked", "false");
      });
      opsi.setAttribute("aria-checked", "true");

      if (jawaban === "a") {
        opsi.classList.add("benar");
        tampilkanUmpanBalik(pesanBenar, "benar");
        selesaikanKuis();
      } else {
        opsi.classList.add("salah");
        var pesan = jawaban === "b" ? pesanSalahB : pesanSalahC;
        tampilkanUmpanBalik(pesan, "salah");
      }
    });
  });

  // Jika misi ini pernah diselesaikan sebelumnya (kunjungan ulang)
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    lencanaSelesai.hidden = false;
    pernahPenuh = true;
    bagianKuis.hidden = false;
  }

  /* ---------- 5. Tombol "Materi berikutnya" ----------
     Halaman berikutnya (Laboratorium) dibuat di langkah selanjutnya.
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
