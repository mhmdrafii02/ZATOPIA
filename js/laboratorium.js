/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/laboratorium.js
   Halaman Laboratorium Perubahan Wujud.
   Tugas:
   1. Menyapa siswa dengan nama + menampilkan avatar pemandu
   2. Menampilkan panel detail saat sebuah kartu panah diklik
   3. Karakter pemandu ikut berkomentar sesuai kartu yang dipilih
   4. Menghitung "sudah dipelajari" dan menyimpan progress setelah
      keenam perubahan wujud dibuka minimal sekali
   5. Menangani tombol "Lanjut ke Eksperimen" (aman jika halaman belum ada)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Data enam perubahan wujud ----------
     Ubah teks di sini kapan saja; tampilan akan menyesuaikan otomatis.
     dari/ke  : nama wujud awal dan akhir
     ikonDari/ikonKe : emoji wujud awal dan akhir
     jenis    : "panas" (dipanaskan) atau "dingin" (didinginkan)
     penjelasan : kalimat penjelasan singkat
     contoh   : daftar contoh kehidupan sehari-hari
     kataKarakter : kalimat pendek yang diucapkan Zaki/Zara di gelembung atas */
  var DATA_PERUBAHAN = {
    mencair: {
      nama: "Mencair",
      dari: "Padat",
      ke: "Cair",
      ikonDari: "🧊",
      ikonKe: "💧",
      jenis: "panas",
      penjelasan:
        "Mencair adalah perubahan dari zat padat menjadi zat cair karena zat tersebut dipanaskan.",
      contoh: [
        "Es batu yang meleleh saat dijemur di bawah matahari",
        "Mentega yang meleleh saat dipanaskan di wajan",
      ],
      kataKarakter:
        "Kalau dipanaskan, zat padat bisa mencair jadi zat cair, lho!",
    },
    membeku: {
      nama: "Membeku",
      dari: "Cair",
      ke: "Padat",
      ikonDari: "💧",
      ikonKe: "🧊",
      jenis: "dingin",
      penjelasan:
        "Membeku adalah perubahan dari zat cair menjadi zat padat karena zat tersebut didinginkan.",
      contoh: [
        "Air yang didinginkan menjadi es batu di dalam freezer",
        "Air es krim yang membeku sebelum disantap",
      ],
      kataKarakter:
        "Kalau didinginkan terus-menerus, air bisa membeku jadi es!",
    },
    menguap: {
      nama: "Menguap",
      dari: "Cair",
      ke: "Gas",
      ikonDari: "💧",
      ikonKe: "☁️",
      jenis: "panas",
      penjelasan:
        "Menguap adalah perubahan dari zat cair menjadi gas karena zat tersebut dipanaskan.",
      contoh: [
        "Air yang mendidih berubah menjadi uap panas",
        "Pakaian basah yang menjadi kering saat dijemur",
      ],
      kataKarakter:
        "Air yang terus dipanaskan lama-lama berubah jadi uap, itu namanya menguap!",
    },
    mengembun: {
      nama: "Mengembun",
      dari: "Gas",
      ke: "Cair",
      ikonDari: "☁️",
      ikonKe: "💧",
      jenis: "dingin",
      penjelasan:
        "Mengembun adalah perubahan dari gas menjadi zat cair karena gas tersebut didinginkan.",
      contoh: [
        "Titik-titik air di luar gelas berisi es",
        "Kaca jendela yang berembun di pagi hari",
      ],
      kataKarakter:
        "Coba perhatikan gelas berisi es, ada titik air di luarnya. Itu contoh mengembun!",
    },
    menyublim: {
      nama: "Menyublim",
      dari: "Padat",
      ke: "Gas",
      ikonDari: "🧊",
      ikonKe: "☁️",
      jenis: "panas",
      penjelasan:
        "Menyublim adalah perubahan dari zat padat langsung menjadi gas, tanpa melalui wujud cair.",
      contoh: [
        "Kapur barus yang lama-lama mengecil dan habis",
        "Es kering (dry ice) yang mengeluarkan asap dingin",
      ],
      kataKarakter:
        "Ada juga zat padat yang bisa langsung jadi gas, namanya menyublim!",
    },
    mengkristal: {
      nama: "Mengkristal",
      dari: "Gas",
      ke: "Padat",
      ikonDari: "☁️",
      ikonKe: "🧊",
      jenis: "dingin",
      penjelasan:
        "Mengkristal adalah perubahan dari gas langsung menjadi zat padat, tanpa melalui wujud cair.",
      contoh: [
        "Salju yang terbentuk dari uap air di awan",
        "Embun beku (frost) di rerumputan pada pagi yang sangat dingin",
      ],
      kataKarakter:
        "Kebalikan dari menyublim namanya mengkristal, gas langsung jadi padat!",
    },
  };

  var URUTAN = [
    "mencair",
    "membeku",
    "menguap",
    "mengembun",
    "menyublim",
    "mengkristal",
  ];

  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "laboratorium"

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

  /* ---------- 2 & 3. Diagram: klik kartu panah -> panel detail + kata karakter ---------- */
  var daftarKartu = document.querySelectorAll(".kartu-panah");
  var panelDetail = document.getElementById("panel-detail");
  var hitungDipelajari = document.getElementById("hitung-dipelajari");
  var kotakSelesai = document.getElementById("kotak-selesai");
  var selesaiInfo = document.getElementById("selesai-info");

  var sudahDipelajari = {}; // { mencair: true, ... }
  var jumlahDipelajari = 0;
  var halamanSelesai = false;

  function tampilkanPanel(id) {
    var data = DATA_PERUBAHAN[id];

    var isi = document.createElement("div");
    isi.className = "panel-isi";

    var atas = document.createElement("div");
    atas.className = "panel-atas";

    // Ilustrasi ikon-ke-ikon
    var ilustrasi = document.createElement("div");
    ilustrasi.className = "panel-ilustrasi";
    ilustrasi.setAttribute("aria-hidden", "true");
    var iDari = document.createElement("span");
    iDari.textContent = data.ikonDari;
    var iPanah = document.createElement("span");
    iPanah.className = "panel-panah";
    iPanah.textContent = "➜";
    var iKe = document.createElement("span");
    iKe.textContent = data.ikonKe;
    ilustrasi.appendChild(iDari);
    ilustrasi.appendChild(iPanah);
    ilustrasi.appendChild(iKe);

    // Judul + arah + tanda panas/dingin
    var judulGrup = document.createElement("div");
    judulGrup.className = "panel-judul-grup";

    var judul = document.createElement("h3");
    judul.className = "panel-judul";
    judul.textContent = data.ikonDari + " " + data.nama + " " + data.ikonKe;

    var arah = document.createElement("p");
    arah.className = "panel-arah";
    arah.textContent = data.dari + " → " + data.ke;

    var tanda = document.createElement("span");
    tanda.className = "panel-tanda " + data.jenis;
    tanda.textContent =
      data.jenis === "panas" ? "🔥 Karena dipanaskan" : "❄️ Karena didinginkan";

    judulGrup.appendChild(judul);
    judulGrup.appendChild(arah);
    judulGrup.appendChild(tanda);

    atas.appendChild(ilustrasi);
    atas.appendChild(judulGrup);

    var penjelasan = document.createElement("p");
    penjelasan.className = "panel-penjelasan";
    penjelasan.textContent = data.penjelasan;

    var contohJudul = document.createElement("p");
    contohJudul.className = "panel-contoh-judul";
    contohJudul.textContent = "Contoh dalam kehidupan sehari-hari:";

    var contohDaftar = document.createElement("ul");
    contohDaftar.className = "panel-contoh-daftar";
    data.contoh.forEach(function (kalimat) {
      var li = document.createElement("li");
      li.textContent = kalimat;
      contohDaftar.appendChild(li);
    });

    isi.appendChild(atas);
    isi.appendChild(penjelasan);
    isi.appendChild(contohJudul);
    isi.appendChild(contohDaftar);

    panelDetail.textContent = ""; // kosongkan isi lama (termasuk "panel-kosong")
    panelDetail.appendChild(isi);
  }

  function pilihKartu(kartu) {
    var id = kartu.getAttribute("data-id");
    var data = DATA_PERUBAHAN[id];

    // Tandai kartu yang sedang aktif
    daftarKartu.forEach(function (lain) {
      lain.classList.remove("aktif");
    });
    kartu.classList.add("aktif");

    tampilkanPanel(id);

    // Karakter ikut berkomentar
    temanTeks.textContent = pilihanAvatar.nama + ": " + data.kataKarakter;

    // Hitung "sudah dipelajari" (sekali per perubahan)
    if (!sudahDipelajari[id]) {
      sudahDipelajari[id] = true;
      jumlahDipelajari++;
      kartu.classList.add("dipelajari");
      hitungDipelajari.textContent =
        "Sudah dipelajari: " + jumlahDipelajari + " dari " + URUTAN.length;

      if (jumlahDipelajari === URUTAN.length) {
        selesaikanLaboratorium();
      }
    }

    // Jika panel berada di luar layar (terutama di HP), gulirkan pelan agar terlihat
    var kotak = panelDetail.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      panelDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  daftarKartu.forEach(function (kartu) {
    kartu.addEventListener("click", function () {
      pilihKartu(kartu);
    });
  });

  /* ---------- 4. Selesai: simpan progress ---------- */
  function selesaikanLaboratorium() {
    halamanSelesai = true;

    var berhasil = ZatopiaProgress.tandaiSelesai(kodeLokasi);
    selesaiInfo.textContent = berhasil
      ? "Progress petualanganmu sudah disimpan."
      : "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";

    kotakSelesai.hidden = false;
    tombolBerikutnya.classList.add("menyala"); // tombol berikutnya berdenyut pelan
  }

  // Jika halaman ini pernah diselesaikan sebelumnya (kunjungan ulang)
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    halamanSelesai = true;
    jumlahDipelajari = URUTAN.length;
    URUTAN.forEach(function (id) {
      sudahDipelajari[id] = true;
    });

    daftarKartu.forEach(function (kartu) {
      kartu.classList.add("dipelajari");
    });
    hitungDipelajari.textContent =
      "Sudah dipelajari: " + jumlahDipelajari + " dari " + URUTAN.length;
    kotakSelesai.hidden = false;
    selesaiInfo.textContent = "Progress petualanganmu sudah disimpan.";
    tombolBerikutnya.classList.add("menyala");
  }

  /* ---------- 5. Tombol "Lanjut ke Eksperimen" ----------
     Halaman berikutnya (Zona Eksperimen) dibuat di langkah selanjutnya.
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
