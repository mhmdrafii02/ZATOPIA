/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/eksperimen.js
   Halaman Zona Eksperimen.
   Tugas:
   1. Menyapa siswa dengan nama + menampilkan avatar teman belajar
   2. Eksperimen 1: es dipanaskan -> mencair
   3. Eksperimen 2: gelas dingin -> mengembun
   4. Eksperimen 3: pakaian dijemur -> menguap
   5. Kuis pilihan ganda pada tiap eksperimen, dengan umpan balik langsung
   6. Menghitung eksperimen selesai dan menyimpan progress setelah 3 dari 3
   7. Menangani tombol "Lanjut ke Game" (aman jika halaman belum ada)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "zona-eksperimen"

  var temanTeks = document.getElementById("teman-teks");
  var tombolBerikutnya = document.getElementById("tombol-berikutnya");

  /* ---------- 1. Data siswa: nama dan avatar (sama seperti halaman lain) ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var avatar = ZatopiaStorage.ambil("avatar", "");
  if (avatar !== "zaki" && avatar !== "zara") {
    avatar = "zaki";
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
  var pilihanAvatar = dataAvatar[avatar];

  halaman.setAttribute("data-avatar", avatar);
  document.getElementById("emoji-teman").textContent = pilihanAvatar.emoji;
  var gambarTeman = document.getElementById("avatar-teman");
  gambarTeman.alt = pilihanAvatar.nama;
  gambarTeman.src = pilihanAvatar.gambar;

  /* ---------- Status keseluruhan halaman ---------- */
  var hitungEksperimen = document.getElementById("hitung-eksperimen");
  var kotakSelesaiHalaman = document.getElementById("kotak-selesai");
  var selesaiInfoHalaman = document.getElementById("selesai-info");

  var eksperimenSelesai = { es: false, gelas: false, pakaian: false };

  function jumlahSelesai() {
    var n = 0;
    for (var kunci in eksperimenSelesai) {
      if (eksperimenSelesai[kunci]) {
        n++;
      }
    }
    return n;
  }

  function perbaruiHitunganHalaman() {
    var n = jumlahSelesai();
    hitungEksperimen.textContent = "Eksperimen selesai: " + n + " dari 3";
    if (n === 3) {
      var berhasil = ZatopiaProgress.tandaiSelesai(kodeLokasi);
      selesaiInfoHalaman.textContent = berhasil
        ? "Progress petualanganmu sudah disimpan."
        : "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";
      kotakSelesaiHalaman.hidden = false;
      tombolBerikutnya.classList.add("menyala"); // tombol berikutnya berdenyut pelan
      kotakSelesaiHalaman.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  /* ---------- Fungsi bantu umum untuk kuis pilihan ganda ----------
     Dipakai oleh ketiga eksperimen supaya kodenya tidak diulang tiga kali. */
  function pasangKuis(idEksperimen, idPertanyaan, idUmpanBalik, idLencana) {
    var kotakPertanyaan = document.getElementById(idPertanyaan);
    var grupPilihan = kotakPertanyaan.querySelector(".pilihan-eksperimen");
    var jawabanBenar = grupPilihan.getAttribute("data-jawaban-benar");
    var pesanBenar = grupPilihan.getAttribute("data-pesan-benar");
    var pesanSalah = grupPilihan.getAttribute("data-pesan-salah");

    var daftarOpsi = grupPilihan.querySelectorAll(".opsi-kuis");
    var umpanBalik = document.getElementById(idUmpanBalik);
    var lencana = document.getElementById(idLencana);

    var sudahBenar = false;

    function tampilkanUmpanBalik(teks, jenis) {
      umpanBalik.textContent = teks;
      umpanBalik.className = "umpan-balik umpan-" + jenis + " baru";

      var kotak = umpanBalik.getBoundingClientRect();
      if (kotak.bottom > window.innerHeight || kotak.top < 0) {
        umpanBalik.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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

        if (jawaban === jawabanBenar) {
          opsi.classList.add("benar");
          sudahBenar = true;
          daftarOpsi.forEach(function (lain) {
            lain.setAttribute("aria-disabled", "true");
          });
          tampilkanUmpanBalik(pesanBenar, "benar");

          lencana.hidden = false;
          eksperimenSelesai[idEksperimen] = true;
          perbaruiHitunganHalaman();
        } else {
          opsi.classList.add("salah");
          tampilkanUmpanBalik(pesanSalah, "salah");
        }
      });
    });
  }

  /* ---------- 2. Eksperimen 1: es dipanaskan -> mencair ---------- */
  var keadaanEs = document.getElementById("keadaan-es");
  var keadaanAir = document.getElementById("keadaan-air");
  var apiPanas = document.getElementById("api-panas");
  var labelEs = document.getElementById("label-es");
  var pertanyaanEs = document.getElementById("pertanyaan-es");

  document
    .getElementById("tombol-panaskan")
    .addEventListener("click", function () {
      // Tampilkan es -> air. Elemen <g> SVG ditangani dengan setAttribute/removeAttribute
      // (bukan properti .hidden) supaya pasti berhasil di semua browser.
      keadaanEs.setAttribute("hidden", "");
      keadaanAir.removeAttribute("hidden");
      labelEs.hidden = false;

      // Api muncul sesaat lalu hilang lagi
      apiPanas.removeAttribute("hidden");
      setTimeout(function () {
        apiPanas.setAttribute("hidden", "");
      }, 900);

      pertanyaanEs.hidden = false;
    });

  pasangKuis("es", "pertanyaan-es", "umpan-es", "lencana-es");

  /* ---------- 3. Eksperimen 2: gelas dingin -> mengembun ---------- */
  var titikEmbun = document.getElementById("titik-embun");
  var labelGelas = document.getElementById("label-gelas");
  var pertanyaanGelas = document.getElementById("pertanyaan-gelas");

  document
    .getElementById("tombol-amati")
    .addEventListener("click", function () {
      titikEmbun.removeAttribute("hidden");
      labelGelas.hidden = false;
      pertanyaanGelas.hidden = false;
    });

  pasangKuis("gelas", "pertanyaan-gelas", "umpan-gelas", "lencana-gelas");

  /* ---------- 4. Eksperimen 3: pakaian dijemur -> menguap ---------- */
  var matahariJemur = document.getElementById("matahari-jemur");
  var keadaanBasah = document.getElementById("keadaan-basah");
  var keadaanKering = document.getElementById("keadaan-kering");
  var labelPakaian = document.getElementById("label-pakaian");
  var pertanyaanPakaian = document.getElementById("pertanyaan-pakaian");

  document
    .getElementById("tombol-jemur")
    .addEventListener("click", function () {
      matahariJemur.removeAttribute("hidden");
      keadaanBasah.setAttribute("hidden", "");
      keadaanKering.removeAttribute("hidden");
      labelPakaian.hidden = false;
      pertanyaanPakaian.hidden = false;
    });

  pasangKuis(
    "pakaian",
    "pertanyaan-pakaian",
    "umpan-pakaian",
    "lencana-pakaian",
  );

  /* ---------- 5. Tombol "Lanjut ke Game" ----------
     Halaman berikutnya (Arena Game) dibuat di langkah selanjutnya.
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

  /* ---------- Jika halaman ini pernah diselesaikan (kunjungan ulang) ---------- */
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    eksperimenSelesai = { es: true, gelas: true, pakaian: true };
    ["lencana-es", "lencana-gelas", "lencana-pakaian"].forEach(function (id) {
      document.getElementById(id).hidden = false;
    });
    hitungEksperimen.textContent = "Eksperimen selesai: 3 dari 3";
    kotakSelesaiHalaman.hidden = false;
    selesaiInfoHalaman.textContent = "Progress petualanganmu sudah disimpan.";
    tombolBerikutnya.classList.add("menyala");
  }
});
