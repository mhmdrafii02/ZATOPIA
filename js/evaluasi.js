/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/evaluasi.js
   Halaman Evaluasi (Misi Akhir): 10 soal pilihan ganda,
   satu soal per tampilan, jawaban terkunci setelah
   menekan Berikutnya, jawaban benar TIDAK ditampilkan
   selama evaluasi berlangsung.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Data 10 soal ----------
     jawaban: indeks pilihan yang benar (0 = A, 1 = B, dst).
     Urutan topik: konsep zat, wujud padat, cair, gas,
     lalu keenam perubahan wujud. */
  var DAFTAR_SOAL = [
    {
      topik: "Konsep Zat",
      teks: "Sesuatu yang memiliki massa dan menempati ruang disebut...",
      pilihan: ["Energi", "Zat", "Gaya", "Cahaya"],
      jawaban: 1,
    },
    {
      topik: "Wujud Padat",
      teks: "Ciri utama zat padat adalah...",
      pilihan: [
        "Bentuk dan volumenya tetap",
        "Bentuknya mengikuti wadah",
        "Tidak memiliki bentuk tetap",
        "Mudah dimampatkan",
      ],
      jawaban: 0,
    },
    {
      topik: "Wujud Cair",
      teks: "Air yang dituang ke dalam gelas akan...",
      pilihan: [
        "Tetap berbentuk seperti semula",
        "Mengikuti bentuk gelas",
        "Berubah menjadi gas",
        "Menghilang",
      ],
      jawaban: 1,
    },
    {
      topik: "Wujud Gas",
      teks: "Udara yang ditiupkan ke dalam balon akan...",
      pilihan: [
        "Hanya mengisi sebagian kecil balon",
        "Memenuhi seluruh ruang balon",
        "Tidak menempati ruang",
        "Berkumpul di dasar balon saja",
      ],
      jawaban: 1,
    },
    {
      topik: "Mencair",
      teks: "Es batu yang diletakkan di meja lama-kelamaan berubah menjadi air. Perubahan tersebut disebut...",
      pilihan: ["Membeku", "Mencair", "Menguap", "Mengembun"],
      jawaban: 1,
    },
    {
      topik: "Membeku",
      teks: "Segelas air yang dimasukkan ke dalam freezer semalaman berubah menjadi es. Peristiwa ini disebut...",
      pilihan: ["Mencair", "Menguap", "Membeku", "Menyublim"],
      jawaban: 2,
    },
    {
      topik: "Menguap",
      teks: "Pakaian basah yang dijemur di bawah sinar matahari lama-kelamaan menjadi kering karena airnya mengalami...",
      pilihan: ["Mengembun", "Menguap", "Membeku", "Mengkristal"],
      jawaban: 1,
    },
    {
      topik: "Mengembun",
      teks: "Titik-titik air yang muncul di permukaan luar gelas berisi es disebut peristiwa...",
      pilihan: ["Menguap", "Mencair", "Mengembun", "Menyublim"],
      jawaban: 2,
    },
    {
      topik: "Menyublim",
      teks: "Kapur barus yang disimpan lama-kelamaan mengecil dan habis tanpa meninggalkan cairan. Peristiwa ini disebut...",
      pilihan: ["Menyublim", "Mengkristal", "Mencair", "Membeku"],
      jawaban: 0,
    },
    {
      topik: "Mengkristal",
      teks: "Uap air di awan yang berubah langsung menjadi salju mengalami peristiwa...",
      pilihan: ["Menguap", "Mencair", "Mengkristal", "Membeku"],
      jawaban: 2,
    },
  ];
  var TOTAL_SOAL = DAFTAR_SOAL.length;
  var HURUF = ["A", "B", "C", "D"];

  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "misi-akhir"

  var temanTeks = document.getElementById("teman-teks");

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

  /* ---------- 2. Elemen halaman ---------- */
  var layarPembuka = document.getElementById("layar-pembuka");
  var layarSoal = document.getElementById("layar-soal");
  var layarSelesai = document.getElementById("layar-selesai");

  var progresTeks = document.getElementById("progres-soal-teks");
  var progresBar = document.getElementById("progres-soal-bar");
  var progresIsi = document.getElementById("progres-soal-isi");
  var topikSoal = document.getElementById("topik-soal");
  var teksSoal = document.getElementById("teks-soal");
  var pilihanSoal = document.getElementById("pilihan-soal");
  var tombolBerikutnya = document.getElementById("tombol-berikutnya");

  var pesanSelesai = document.getElementById("pesan-selesai");

  /* ---------- 3. Status evaluasi ---------- */
  var indexSoal = 0;
  var jawabanSiswa = new Array(TOTAL_SOAL).fill(null); // indeks pilihan yang dipilih siswa
  var soalTerkunci = false; // true setelah tombol Berikutnya ditekan untuk soal ini

  function tampilkanSoal() {
    var soal = DAFTAR_SOAL[indexSoal];
    soalTerkunci = false;

    progresTeks.textContent = "Soal " + (indexSoal + 1) + " dari " + TOTAL_SOAL;
    progresBar.setAttribute("aria-valuenow", indexSoal + 1);
    progresIsi.style.width =
      Math.round(((indexSoal + 1) / TOTAL_SOAL) * 100) + "%";

    topikSoal.textContent = soal.topik;
    teksSoal.textContent = soal.teks;

    // Bangun ulang pilihan jawaban (textContent = aman)
    pilihanSoal.textContent = "";
    pilihanSoal.classList.remove("terkunci");

    soal.pilihan.forEach(function (teksPilihan, i) {
      var tombol = document.createElement("button");
      tombol.type = "button";
      tombol.className = "opsi-soal";
      tombol.setAttribute("role", "radio");
      tombol.setAttribute("aria-checked", "false");
      tombol.setAttribute("data-index", i);

      var huruf = document.createElement("span");
      huruf.className = "opsi-huruf";
      huruf.textContent = HURUF[i];

      var teksEl = document.createElement("span");
      teksEl.className = "opsi-teks";
      teksEl.textContent = teksPilihan;

      tombol.appendChild(huruf);
      tombol.appendChild(teksEl);

      tombol.addEventListener("click", function () {
        pilihJawaban(i);
      });

      pilihanSoal.appendChild(tombol);
    });

    // Jika siswa sebelumnya sudah menjawab soal ini (misalnya kembali dengan tombol Back
    // browser), tampilkan pilihannya kembali sebagai terkunci.
    if (jawabanSiswa[indexSoal] !== null) {
      tandaiPilihan(jawabanSiswa[indexSoal]);
      kunciSoal();
    } else {
      tombolBerikutnya.disabled = true;
    }

    tombolBerikutnya.textContent =
      indexSoal === TOTAL_SOAL - 1 ? "Selesai ✓" : "Berikutnya →";
  }

  function tandaiPilihan(i) {
    var daftarOpsi = pilihanSoal.querySelectorAll(".opsi-soal");
    daftarOpsi.forEach(function (opsi, j) {
      var dipilih = j === i;
      opsi.classList.toggle("dipilih", dipilih);
      opsi.setAttribute("aria-checked", dipilih ? "true" : "false");
    });
  }

  function pilihJawaban(i) {
    if (soalTerkunci) {
      return; // jawaban tidak bisa diganti setelah dikunci
    }
    jawabanSiswa[indexSoal] = i;
    tandaiPilihan(i);
    tombolBerikutnya.disabled = false;
  }

  function kunciSoal() {
    soalTerkunci = true;
    pilihanSoal.classList.add("terkunci");
    pilihanSoal.querySelectorAll(".opsi-soal").forEach(function (opsi) {
      opsi.setAttribute("aria-disabled", "true");
    });
  }

  tombolBerikutnya.addEventListener("click", function () {
    if (jawabanSiswa[indexSoal] === null) {
      return; // jaga-jaga; tombol seharusnya sudah nonaktif
    }

    // Kunci jawaban soal ini (tidak dapat diganti lagi)
    kunciSoal();

    if (indexSoal < TOTAL_SOAL - 1) {
      indexSoal++;
      tampilkanSoal();
      layarSoal.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      selesaikanEvaluasi();
    }
  });

  /* ---------- 4. Mulai evaluasi ---------- */
  document
    .getElementById("tombol-mulai")
    .addEventListener("click", function () {
      layarPembuka.hidden = true;
      layarSoal.hidden = false;
      indexSoal = 0;
      tampilkanSoal();
    });

  /* ---------- 5. Selesai: hitung skor, simpan, lalu ke halaman Hasil ---------- */
  function hitungBenar() {
    var jumlah = 0;
    for (var i = 0; i < TOTAL_SOAL; i++) {
      if (jawabanSiswa[i] === DAFTAR_SOAL[i].jawaban) {
        jumlah++;
      }
    }
    return jumlah;
  }

  function selesaikanEvaluasi() {
    var benar = hitungBenar();

    var berhasilSimpanHasil = ZatopiaEvaluasi.simpanHasil(benar, TOTAL_SOAL);
    var berhasilProgress = ZatopiaProgress.tandaiSelesai(kodeLokasi);

    layarSoal.hidden = true;

    if (!berhasilSimpanHasil || !berhasilProgress) {
      pesanSelesai.textContent =
        "Jawabanmu sudah selesai, tetapi hasilnya belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";
    }

    // Coba arahkan otomatis ke halaman Hasil. Jika halamannya belum ada,
    // tampilkan layar selesai dengan tombol "Lihat Hasil" sebagai cadangan
    // (aman, tidak menampilkan halaman error).
    periksaHalaman("hasil.html").then(function (ada) {
      if (ada === true) {
        window.location.href = "hasil.html";
      } else {
        layarSelesai.hidden = false;
        if (ada === false) {
          ZatopiaToast(
            "Halaman Hasil sedang disiapkan. Tunggu ya, Penjelajah!",
          );
        }
      }
    });
  }

  /* ---------- Fungsi bantu: periksa apakah sebuah halaman sudah ada ---------- */
  function periksaHalaman(alamat) {
    return fetch(alamat, { method: "HEAD" })
      .then(function (respon) {
        return respon.ok;
      })
      .catch(function () {
        return null;
      });
  }

  // Tombol "Lihat Hasil" pada layar selesai (cadangan) memakai pemeriksaan yang sama
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
