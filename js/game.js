/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/game.js
   Halaman Arena Game. Berisi tiga mini-game:
   1. 🎯 Tangkap Wujud       (pilih wujud yang tepat)
   2. 🧩 Pasangkan Perubahan (cocokkan perubahan dengan namanya)
   3. 🔎 Detektif Zat        (kasus sehari-hari pilihan ganda)
   Ditutup dengan sistem skor (ZatopiaSkor) dan progress
   Arena Game (ZatopiaProgress) setelah ketiga game selesai.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "arena-game"

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

  /* ---------- Fungsi bantu umum ---------- */

  // Mengacak urutan isi array (tidak mengubah array asli)
  function acak(daftarAsli) {
    var daftar = daftarAsli.slice();
    for (var i = daftar.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var sementara = daftar[i];
      daftar[i] = daftar[j];
      daftar[j] = sementara;
    }
    return daftar;
  }

  function tampilkanUmpanBalik(elemen, teks, jenis) {
    elemen.textContent = teks;
    elemen.className = "umpan-balik umpan-" + jenis + " baru";
    var kotak = elemen.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      elemen.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function goyangkan(elemen) {
    elemen.classList.remove("goyang");
    void elemen.offsetWidth; // memulai ulang animasi
    elemen.classList.add("goyang");
    setTimeout(function () {
      elemen.classList.remove("goyang");
    }, 500);
  }

  /* ---------- Papan skor keseluruhan (ZatopiaSkor, dipakai bersama 3 game) ---------- */
  var elSkorTotal = document.getElementById("skor-total");
  var elSkorBenar = document.getElementById("skor-benar");
  var elSkorSalah = document.getElementById("skor-salah");

  function tampilkanSkor() {
    var skor = ZatopiaSkor.ambil();
    elSkorBenar.textContent = skor.benar;
    elSkorSalah.textContent = skor.salah;
    elSkorTotal.textContent = skor.benar; // skor utama = jumlah jawaban benar
  }
  function catatBenar() {
    ZatopiaSkor.tambahBenar();
    tampilkanSkor();
  }
  function catatSalah() {
    ZatopiaSkor.tambahSalah();
    tampilkanSkor();
  }
  tampilkanSkor();

  /* ---------- Status tiga game + progress keseluruhan halaman ---------- */
  var gameSelesai = { 1: false, 2: false, 3: false };
  var progresGame = document.getElementById("progres-game");
  var kotakSelesaiHalaman = document.getElementById("kotak-selesai");
  var selesaiInfoHalaman = document.getElementById("selesai-info");

  function jumlahGameSelesai() {
    var n = 0;
    for (var k in gameSelesai) {
      if (gameSelesai[k]) {
        n++;
      }
    }
    return n;
  }

  function tandaiGameSelesai(nomor, idLencana) {
    if (gameSelesai[nomor]) {
      return;
    }
    gameSelesai[nomor] = true;
    document.getElementById(idLencana).hidden = false;

    var n = jumlahGameSelesai();
    progresGame.textContent = "Game selesai: " + n + " dari 3";

    if (n === 3) {
      var berhasil = ZatopiaProgress.tandaiSelesai(kodeLokasi);
      selesaiInfoHalaman.textContent = berhasil
        ? "Progress petualanganmu sudah disimpan."
        : "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!";
      kotakSelesaiHalaman.hidden = false;
      tombolBerikutnya.classList.add("menyala");
      kotakSelesaiHalaman.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  /* =====================================================
     GAME 1 — 🎯 TANGKAP WUJUD
     ===================================================== */
  var DATA_BENDA = [
    { nama: "Es batu", emoji: "🧊", wujud: "padat" },
    { nama: "Air", emoji: "💧", wujud: "cair" },
    { nama: "Batu", emoji: "🪨", wujud: "padat" },
    { nama: "Udara", emoji: "🌬️", wujud: "gas" },
    { nama: "Susu", emoji: "🥛", wujud: "cair" },
    { nama: "Uap", emoji: "☁️", wujud: "gas" },
  ];
  var TOTAL_SOAL_1 = DATA_BENDA.length;

  var soalUrutan1 = [];
  var indexSoal1 = 0;
  var benarSoal1 = 0;

  var soalHitung1 = document.getElementById("soal-1-hitung");
  var tangkapIkon = document.getElementById("tangkap-ikon");
  var tangkapNama = document.getElementById("tangkap-nama");
  var tombolWujud = document.querySelectorAll(".tombol-wujud");
  var umpan1 = document.getElementById("umpan-1");
  var lanjut1 = document.getElementById("lanjut-1");
  var selesai1 = document.getElementById("selesai-1");
  var selesai1Info = document.getElementById("selesai-1-info");

  function mulaiGame1() {
    soalUrutan1 = acak(DATA_BENDA);
    indexSoal1 = 0;
    benarSoal1 = 0;
    selesai1.hidden = true;
    tampilkanSoal1();
  }

  function tampilkanSoal1() {
    var soal = soalUrutan1[indexSoal1];
    soalHitung1.textContent =
      "Soal " + (indexSoal1 + 1) + " dari " + TOTAL_SOAL_1;
    tangkapIkon.textContent = soal.emoji;
    tangkapNama.textContent = soal.nama;

    // Mainkan animasi kecil setiap soal baru muncul
    tangkapIkon.style.animation = "none";
    void tangkapIkon.offsetWidth;
    tangkapIkon.style.animation = "";

    tombolWujud.forEach(function (tombol) {
      tombol.classList.remove("benar", "salah");
      tombol.removeAttribute("aria-disabled");
    });
    umpan1.textContent = "";
    umpan1.className = "umpan-balik";
    lanjut1.hidden = true;
  }

  tombolWujud.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      if (tombol.getAttribute("aria-disabled") === "true") {
        return;
      }

      var soal = soalUrutan1[indexSoal1];
      var jawaban = tombol.getAttribute("data-wujud");

      tombolWujud.forEach(function (t) {
        t.setAttribute("aria-disabled", "true");
      });

      if (jawaban === soal.wujud) {
        tombol.classList.add("benar");
        benarSoal1++;
        catatBenar();
        tampilkanUmpanBalik(
          umpan1,
          "🎉 Benar! " + soal.nama + " termasuk zat " + soal.wujud + ".",
          "benar",
        );
      } else {
        tombol.classList.add("salah");
        catatSalah();
        var jawabanBenarTombol = document.querySelector(
          '.tombol-wujud[data-wujud="' + soal.wujud + '"]',
        );
        jawabanBenarTombol.classList.add("benar");
        tampilkanUmpanBalik(
          umpan1,
          "Belum tepat. " + soal.nama + " termasuk zat " + soal.wujud + ".",
          "salah",
        );
      }

      if (indexSoal1 < TOTAL_SOAL_1 - 1) {
        lanjut1.hidden = false;
      } else {
        selesaikanGame1();
      }
    });
  });

  lanjut1.addEventListener("click", function () {
    indexSoal1++;
    tampilkanSoal1();
  });

  function selesaikanGame1() {
    selesai1Info.textContent =
      "Kamu menjawab benar " + benarSoal1 + " dari " + TOTAL_SOAL_1 + " soal.";
    selesai1.hidden = false;
    tandaiGameSelesai(1, "lencana-1");
  }

  document.getElementById("ulang-1").addEventListener("click", mulaiGame1);

  mulaiGame1();

  /* =====================================================
     GAME 2 — 🧩 PASANGKAN PERUBAHAN
     ===================================================== */
  var DATA_PASANGAN = [
    { id: "mencair", dari: "🧊", ke: "💧", nama: "Mencair" },
    { id: "membeku", dari: "💧", ke: "🧊", nama: "Membeku" },
    { id: "menguap", dari: "💧", ke: "☁️", nama: "Menguap" },
    { id: "mengembun", dari: "☁️", ke: "💧", nama: "Mengembun" },
    { id: "menyublim", dari: "🧊", ke: "☁️", nama: "Menyublim" },
    { id: "mengkristal", dari: "☁️", ke: "🧊", nama: "Mengkristal" },
  ];
  var TOTAL_PASANGAN = DATA_PASANGAN.length;

  var kolomPerubahan = document.getElementById("kolom-perubahan");
  var kolomNama = document.getElementById("kolom-nama");
  var hitung2 = document.getElementById("hitung-2");
  var umpan2 = document.getElementById("umpan-2");
  var selesai2 = document.getElementById("selesai-2");
  var selesai2Info = document.getElementById("selesai-2-info");

  var transisiDipilih = null; // kartu kiri yang sedang dipilih (klik)
  var jumlahCocok2 = 0;
  var percobaanSalah2 = {}; // { mencair: true, ... } — dipakai untuk menghitung skor bertahap
  var barusSeret2 = false;

  function buatKartuTransisi(data) {
    var kartu = document.createElement("button");
    kartu.type = "button";
    kartu.className = "kartu-transisi";
    kartu.setAttribute("data-id", data.id);
    kartu.setAttribute("aria-pressed", "false");
    kartu.textContent = data.dari + " ➜ " + data.ke;
    return kartu;
  }
  function buatKartuNama(data) {
    var kartu = document.createElement("button");
    kartu.type = "button";
    kartu.className = "kartu-nama";
    kartu.setAttribute("data-id", data.id);
    kartu.textContent = data.nama;
    return kartu;
  }

  function lepasPilihanTransisi() {
    if (transisiDipilih) {
      transisiDipilih.classList.remove("dipilih");
      transisiDipilih.setAttribute("aria-pressed", "false");
    }
    transisiDipilih = null;
  }

  function cobaPasangkan(kartuTransisi, kartuNama) {
    var idTransisi = kartuTransisi.getAttribute("data-id");
    var idNama = kartuNama.getAttribute("data-id");

    if (idTransisi === idNama) {
      kartuTransisi.classList.add("cocok");
      kartuNama.classList.add("cocok");
      kartuTransisi.setAttribute("aria-disabled", "true");
      kartuNama.setAttribute("aria-disabled", "true");
      lepasPilihanTransisi();

      if (percobaanSalah2[idTransisi]) {
        catatSalah(); // sudah pernah salah untuk pasangan ini: tidak menambah "benar"
      } else {
        catatBenar();
      }

      jumlahCocok2++;
      hitung2.textContent =
        "Sudah dipasangkan: " + jumlahCocok2 + " dari " + TOTAL_PASANGAN;
      tampilkanUmpanBalik(
        umpan2,
        "🎉 Benar! " +
          kartuTransisi.textContent.replace("➜", "→") +
          " = " +
          kartuNama.textContent,
        "benar",
      );

      if (jumlahCocok2 === TOTAL_PASANGAN) {
        selesai2Info.textContent =
          "Kamu berhasil memasangkan semua perubahan wujud.";
        selesai2.hidden = false;
        tandaiGameSelesai(2, "lencana-2");
      }
    } else {
      percobaanSalah2[idTransisi] = true;
      goyangkan(kartuTransisi);
      goyangkan(kartuNama);
      lepasPilihanTransisi();
      catatSalah();
      tampilkanUmpanBalik(
        umpan2,
        "Belum tepat. Coba pasangkan lagi ya!",
        "salah",
      );
    }
  }

  function pasangKlikTransisi(kartu) {
    kartu.addEventListener("click", function () {
      if (barusSeret2 || kartu.getAttribute("aria-disabled") === "true") {
        return;
      }
      if (transisiDipilih === kartu) {
        lepasPilihanTransisi();
        return;
      }
      lepasPilihanTransisi();
      transisiDipilih = kartu;
      kartu.classList.add("dipilih");
      kartu.setAttribute("aria-pressed", "true");
    });
  }
  function pasangKlikNama(kartu) {
    kartu.addEventListener("click", function () {
      if (kartu.getAttribute("aria-disabled") === "true") {
        return;
      }
      if (!transisiDipilih) {
        tampilkanUmpanBalik(
          umpan2,
          "👆 Pilih dulu kartu perubahan di sebelah kiri.",
          "info",
        );
        return;
      }
      cobaPasangkan(transisiDipilih, kartu);
    });
  }

  // Seret dengan mouse (drag-and-drop), sama seperti di Hutan Zat.
  // Layar sentuh memakai klik-klik supaya halaman tetap bisa digulir dengan jari.
  var seret2 = null;
  function kartuNamaDi(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest(".kartu-nama") : null;
  }

  function pasangSeretTransisi(kartu) {
    kartu.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch" || event.button !== 0) {
        return;
      }
      if (kartu.getAttribute("aria-disabled") === "true") {
        return;
      }
      seret2 = {
        kartu: kartu,
        hantu: null,
        mulai: false,
        x: event.clientX,
        y: event.clientY,
      };
    });
  }

  document.addEventListener("pointermove", function (event) {
    if (!seret2) {
      return;
    }
    if (!seret2.mulai) {
      var gx = event.clientX - seret2.x,
        gy = event.clientY - seret2.y;
      if (Math.sqrt(gx * gx + gy * gy) < 6) {
        return;
      }
      seret2.mulai = true;
      var hantu = seret2.kartu.cloneNode(true);
      hantu.removeAttribute("id");
      hantu.className = "kartu-transisi kartu-seret";
      hantu.setAttribute("aria-hidden", "true");
      hantu.tabIndex = -1;
      hantu.style.width = seret2.kartu.offsetWidth + "px";
      document.body.appendChild(hantu);
      seret2.hantu = hantu;
      seret2.kartu.classList.add("sedang-diseret");
    }
    seret2.hantu.style.left = event.clientX + "px";
    seret2.hantu.style.top = event.clientY + "px";

    var sasaran = kartuNamaDi(event.clientX, event.clientY);
    document.querySelectorAll(".kartu-nama").forEach(function (k) {
      k.classList.toggle("sasaran", k === sasaran);
    });
  });

  function akhiriSeret2(event, dibatalkan) {
    if (!seret2) {
      return;
    }
    var data = seret2;
    seret2 = null;
    if (!data.mulai) {
      return;
    }

    data.hantu.parentNode.removeChild(data.hantu);
    data.kartu.classList.remove("sedang-diseret");
    document.querySelectorAll(".kartu-nama").forEach(function (k) {
      k.classList.remove("sasaran");
    });

    barusSeret2 = true;
    setTimeout(function () {
      barusSeret2 = false;
    }, 80);

    if (!dibatalkan) {
      var sasaran = kartuNamaDi(event.clientX, event.clientY);
      if (sasaran && data.kartu.getAttribute("aria-disabled") !== "true") {
        cobaPasangkan(data.kartu, sasaran);
      }
    }
  }
  document.addEventListener("pointerup", function (event) {
    akhiriSeret2(event, false);
  });
  document.addEventListener("pointercancel", function (event) {
    akhiriSeret2(event, true);
  });

  function mulaiGame2() {
    lepasPilihanTransisi();
    jumlahCocok2 = 0;
    percobaanSalah2 = {};

    kolomPerubahan.textContent = "";
    kolomNama.textContent = "";

    acak(DATA_PASANGAN).forEach(function (data) {
      var kartu = buatKartuTransisi(data);
      pasangKlikTransisi(kartu);
      pasangSeretTransisi(kartu);
      kolomPerubahan.appendChild(kartu);
    });
    acak(DATA_PASANGAN).forEach(function (data) {
      var kartu = buatKartuNama(data);
      pasangKlikNama(kartu);
      kolomNama.appendChild(kartu);
    });

    hitung2.textContent = "Sudah dipasangkan: 0 dari " + TOTAL_PASANGAN;
    umpan2.textContent = "";
    umpan2.className = "umpan-balik";
    selesai2.hidden = true;
  }

  document.getElementById("ulang-2").addEventListener("click", mulaiGame2);

  mulaiGame2();

  /* =====================================================
     GAME 3 — 🔎 DETEKTIF ZAT
     ===================================================== */
  var DATA_KASUS = [
    {
      cerita:
        "Rani menjemur pakaian yang basah di bawah sinar matahari. Beberapa jam kemudian, pakaian itu menjadi kering.",
      jawaban: "menguap",
      pesanBenar:
        "🎉 Benar! Air pada pakaian berubah menjadi uap karena panas matahari, itu namanya menguap.",
    },
    {
      cerita:
        "Andi memasukkan segelas air ke dalam freezer sebelum tidur. Keesokan paginya, air di dalam gelas sudah berubah menjadi es.",
      jawaban: "membeku",
      pesanBenar:
        "🎉 Benar! Air yang didinginkan dalam waktu lama berubah menjadi es, itu namanya membeku.",
    },
    {
      cerita:
        "Ibu meletakkan es krim di atas meja saat siang hari. Lama-lama, es krim itu meleleh dan berubah menjadi cair.",
      jawaban: "mencair",
      pesanBenar:
        "🎉 Benar! Es krim yang terkena udara hangat berubah menjadi cair, itu namanya mencair.",
    },
    {
      cerita:
        "Pagi hari, Siti melihat ada titik-titik air di permukaan daun, padahal semalam tidak hujan.",
      jawaban: "mengembun",
      pesanBenar:
        "🎉 Benar! Uap air di udara yang mendingin di malam hari berubah menjadi titik-titik air, itu namanya mengembun.",
    },
  ];
  var PILIHAN_KASUS = [
    { id: "mencair", nama: "Mencair" },
    { id: "membeku", nama: "Membeku" },
    { id: "menguap", nama: "Menguap" },
    { id: "mengembun", nama: "Mengembun" },
  ];
  var TOTAL_KASUS = DATA_KASUS.length;

  var indexKasus = 0;
  var benarKasus = 0;

  var kasusHitung = document.getElementById("kasus-hitung");
  var kasusCerita = document.getElementById("kasus-cerita");
  var pilihanKasus = document.getElementById("pilihan-kasus");
  var umpan3 = document.getElementById("umpan-3");
  var lanjut3 = document.getElementById("lanjut-3");
  var selesai3 = document.getElementById("selesai-3");
  var selesai3Info = document.getElementById("selesai-3-info");

  function mulaiGame3() {
    indexKasus = 0;
    benarKasus = 0;
    selesai3.hidden = true;
    tampilkanKasus();
  }

  function tampilkanKasus() {
    var kasus = DATA_KASUS[indexKasus];
    kasusHitung.textContent =
      "Kasus " + (indexKasus + 1) + " dari " + TOTAL_KASUS;
    kasusCerita.textContent = kasus.cerita;

    pilihanKasus.textContent = "";
    acak(PILIHAN_KASUS).forEach(function (pilihan) {
      var tombol = document.createElement("button");
      tombol.type = "button";
      tombol.className = "opsi-kasus";
      tombol.setAttribute("data-jawaban", pilihan.id);
      tombol.setAttribute("role", "radio");
      tombol.setAttribute("aria-checked", "false");
      tombol.textContent = pilihan.nama;
      pilihanKasus.appendChild(tombol);
    });

    umpan3.textContent = "";
    umpan3.className = "umpan-balik";
    lanjut3.hidden = true;
  }

  pilihanKasus.addEventListener("click", function (event) {
    var tombol = event.target.closest(".opsi-kasus");
    if (!tombol || tombol.getAttribute("aria-disabled") === "true") {
      return;
    }

    var kasus = DATA_KASUS[indexKasus];
    var jawaban = tombol.getAttribute("data-jawaban");

    pilihanKasus.querySelectorAll(".opsi-kasus").forEach(function (opsi) {
      opsi.setAttribute("aria-disabled", "true");
    });

    if (jawaban === kasus.jawaban) {
      tombol.classList.add("benar");
      benarKasus++;
      catatBenar();
      tampilkanUmpanBalik(umpan3, kasus.pesanBenar, "benar");
    } else {
      tombol.classList.add("salah");
      catatSalah();
      var opsiBenar = pilihanKasus.querySelector(
        '.opsi-kasus[data-jawaban="' + kasus.jawaban + '"]',
      );
      if (opsiBenar) {
        opsiBenar.classList.add("benar");
      }
      tampilkanUmpanBalik(umpan3, kasus.pesanBenar, "salah");
    }

    if (indexKasus < TOTAL_KASUS - 1) {
      lanjut3.hidden = false;
    } else {
      selesai3Info.textContent =
        "Kamu menjawab benar " +
        benarKasus +
        " dari " +
        TOTAL_KASUS +
        " kasus.";
      selesai3.hidden = false;
      tandaiGameSelesai(3, "lencana-3");
    }
  });

  lanjut3.addEventListener("click", function () {
    indexKasus++;
    tampilkanKasus();
  });

  document.getElementById("ulang-3").addEventListener("click", mulaiGame3);

  mulaiGame3();

  /* ---------- Jika Arena Game pernah diselesaikan (kunjungan ulang) ---------- */
  if (ZatopiaProgress.sudahSelesai(kodeLokasi)) {
    gameSelesai = { 1: true, 2: true, 3: true };
    ["lencana-1", "lencana-2", "lencana-3"].forEach(function (id) {
      document.getElementById(id).hidden = false;
    });
    progresGame.textContent = "Game selesai: 3 dari 3";
    kotakSelesaiHalaman.hidden = false;
    selesaiInfoHalaman.textContent = "Progress petualanganmu sudah disimpan.";
    tombolBerikutnya.classList.add("menyala");
  }

  /* ---------- Tombol "Lanjut ke Evaluasi" ----------
     Halaman berikutnya (Misi Akhir / Evaluasi) dibuat di langkah selanjutnya.
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
