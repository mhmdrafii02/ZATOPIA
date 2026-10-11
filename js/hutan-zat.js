/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/hutan-zat.js
   Halaman Hutan Zat.
   Isi file ini (urut dari atas):
   1. Sapaan dengan nama siswa + indikator progress
   2. Jelajahi Hutan     (klik benda, muncul kartu info)
   3. Temukan Zat!       (pilih benda yang termasuk zat)
   4. Tiga Wujud Zat     (klik kartu, muncul informasi)
   5. Kelompokkan Zat    (klik atau seret benda ke kelompoknya, ada skor)
   6. Zat di Sekitar Kita (penghitung sederhana)
   7. Status selesai + simpan progress ke localStorage
   8. Link ke halaman yang belum dibuat (aman, tidak error)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var halaman = document.getElementById("halaman-materi");
  var kodeLokasi = halaman.getAttribute("data-lokasi"); // "hutan-zat"

  /* ---------- 0. Pop-up Tujuan Pembelajaran ----------
     Muncul setiap kali halaman Hutan Zat dibuka. Ditaruh paling atas
     supaya tetap berfungsi walaupun bagian lain belum selesai dimuat. */
  var tpOverlay = document.getElementById("tp-overlay");
  var tpMulai = document.getElementById("tp-mulai");
  var tpKembali = document.getElementById("tp-kembali");
  var tpTerbuka = false;

  // Bagian halaman yang dikunci selama pop-up terbuka
  var tpLatar = [
    document.querySelector("header.navbar"),
    halaman,
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

  bukaTujuan();

  /* ---------- Status halaman ---------- */
  var temukanSelesai = false; // aktivitas utama 1: "Temukan Zat!"
  var kelompokSelesai = false; // aktivitas utama 2: "Kelompokkan Zat"
  var halamanSelesai = false; // status Hutan Zat sudah tersimpan?

  /* ---------- Fungsi bantu ---------- */

  // Tampilkan kotak pesan di dalam sebuah aktivitas. jenis: "benar", "salah", atau "info"
  function tampilkanPesan(elemen, teks, jenis) {
    elemen.textContent = teks;
    elemen.className = "umpan-balik umpan-" + jenis + " baru";

    // Jika pesan berada di luar layar, gulirkan pelan agar terlihat
    var kotak = elemen.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      elemen.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Efek goyang singkat untuk jawaban yang belum tepat
  function goyangkan(elemen) {
    elemen.classList.remove("goyang");
    void elemen.offsetWidth; // memulai ulang animasi
    elemen.classList.add("goyang");
    setTimeout(function () {
      elemen.classList.remove("goyang");
    }, 500);
  }

  // Isi kartu info dengan judul + teks (memakai textContent = aman)
  function isiKartuInfo(kartu, emoji, judul, teks) {
    var isi = document.createElement("div");
    isi.className = "info-isi";

    if (emoji) {
      var elEmoji = document.createElement("span");
      elEmoji.className = "info-emoji";
      elEmoji.setAttribute("aria-hidden", "true");
      elEmoji.textContent = emoji;
      isi.appendChild(elEmoji);
    }

    var elTeks = document.createElement("div");
    var elJudul = document.createElement("h3");
    elJudul.className = "info-judul";
    elJudul.textContent = judul;
    var elPenjelasan = document.createElement("p");
    elPenjelasan.className = "info-teks";
    elPenjelasan.textContent = teks;
    elTeks.appendChild(elJudul);
    elTeks.appendChild(elPenjelasan);
    isi.appendChild(elTeks);

    kartu.textContent = ""; // kosongkan isi lama
    kartu.appendChild(isi);

    var kotak = kartu.getBoundingClientRect();
    if (kotak.bottom > window.innerHeight || kotak.top < 0) {
      kartu.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ---------- 1. Sapaan dan progress di header ---------- */
  var nama = ZatopiaStorage.ambil("nama", "");
  var sapaan = document.getElementById("sapaan-siswa");
  if (typeof nama === "string" && nama !== "") {
    sapaan.textContent = "Halo, " + nama + "! 🌟"; // textContent = aman
  } else {
    sapaan.textContent = "Halo, Penjelajah! 🌟";
  }

  var progresAngka = document.getElementById("progres-kepala-angka");
  var progresBar = document.getElementById("progres-kepala-bar");
  var progresIsi = document.getElementById("progres-kepala-isi");

  function tampilkanProgres() {
    var jumlah = ZatopiaProgress.jumlahSelesai();
    var total = ZatopiaProgress.LOKASI.length;
    progresAngka.textContent = jumlah + "/" + total;
    progresBar.setAttribute("aria-valuenow", jumlah);
    progresIsi.style.width = Math.round((jumlah / total) * 100) + "%";
  }

  /* ---------- 2. Jelajahi Hutan ---------- */
  var daftarObjek = document.querySelectorAll(".objek");
  var totalObjek = daftarObjek.length;
  var jumlahDilihat = 0;
  var hitungHutan = document.getElementById("hitung-hutan");
  var kartuInfo = document.getElementById("kartu-info");

  daftarObjek.forEach(function (objek) {
    objek.addEventListener("click", function () {
      var namaObjek = objek.getAttribute("data-nama");

      // Tandai benda yang sedang dibuka
      daftarObjek.forEach(function (lain) {
        lain.classList.remove("terpilih");
      });
      objek.classList.add("terpilih");

      // Animasi kecil ketika diklik
      objek.classList.add("pop");
      setTimeout(function () {
        objek.classList.remove("pop");
      }, 500);

      isiKartuInfo(
        kartuInfo,
        objek.getAttribute("data-emoji"),
        objek.getAttribute("data-emoji") + " " + namaObjek,
        objek.getAttribute("data-teks"),
      );

      // Hitung benda yang sudah dilihat (sekali per benda)
      if (!objek.classList.contains("dilihat")) {
        objek.classList.add("dilihat");
        jumlahDilihat++;
        hitungHutan.textContent =
          "Sudah dilihat: " + jumlahDilihat + " dari " + totalObjek;
      }
      objek.setAttribute("aria-label", namaObjek + ", sudah dilihat");
    });
  });

  /* ---------- 3. Temukan Zat! ---------- */
  var areaTemukan = document.getElementById("aktivitas-temukan");
  var pesanBenarT = areaTemukan.getAttribute("data-pesan-benar");
  var pesanSalahT = areaTemukan.getAttribute("data-pesan-salah");

  var daftarBenda = Array.prototype.slice.call(
    document.querySelectorAll("#daftar-temukan .benda"),
  );
  var totalZat = document.querySelectorAll(
    '#daftar-temukan .benda[data-benar="true"]',
  ).length;
  var zatDitemukan = 0;
  var hitungTemukan = document.getElementById("hitung-temukan");
  var umpanTemukan = document.getElementById("umpan-temukan");
  var selesaiTemukan = document.getElementById("selesai-temukan");
  var lencanaTemukan = document.getElementById("lencana-temukan");

  daftarBenda.forEach(function (benda) {
    benda.setAttribute("aria-label", benda.getAttribute("data-nama"));

    benda.addEventListener("click", function () {
      // Benda yang sudah dipilih tidak bisa dipilih lagi
      if (benda.getAttribute("aria-disabled") === "true") {
        return;
      }
      var namaBenda = benda.getAttribute("data-nama");
      var benar = benda.getAttribute("data-benar") === "true";
      benda.setAttribute("aria-disabled", "true");

      if (benar) {
        benda.classList.add("benar");
        benda.setAttribute("aria-label", namaBenda + ", benar, termasuk zat");
        zatDitemukan++;
        hitungTemukan.textContent =
          "Zat ditemukan: " + zatDitemukan + " dari " + totalZat;
        tampilkanPesan(umpanTemukan, pesanBenarT, "benar");

        if (zatDitemukan === totalZat) {
          selesaikanTemukan();
        }
      } else {
        benda.classList.add("salah");
        benda.setAttribute("aria-label", namaBenda + ", belum tepat");
        tampilkanPesan(umpanTemukan, pesanSalahT, "salah");
      }
    });
  });

  function selesaikanTemukan() {
    // Benda yang belum dipilih diredupkan dan dikunci
    daftarBenda.forEach(function (benda) {
      if (benda.getAttribute("aria-disabled") !== "true") {
        benda.setAttribute("aria-disabled", "true");
        benda.classList.add("bukan");
      }
    });
    selesaiTemukan.hidden = false;
    lencanaTemukan.hidden = false;
    temukanSelesai = true;
    cekSelesai();
  }

  document
    .getElementById("ulang-temukan")
    .addEventListener("click", function () {
      zatDitemukan = 0;
      temukanSelesai = false;
      daftarBenda.forEach(function (benda) {
        benda.classList.remove("benar", "salah", "bukan");
        benda.removeAttribute("aria-disabled");
        benda.setAttribute("aria-label", benda.getAttribute("data-nama"));
      });
      hitungTemukan.textContent = "Zat ditemukan: 0 dari " + totalZat;
      umpanTemukan.textContent = "";
      umpanTemukan.className = "umpan-balik";
      selesaiTemukan.hidden = true;
      lencanaTemukan.hidden = true;
      perbaruiStatus();
    });

  /* ---------- 4. Tiga Wujud Zat ---------- */
  var kartuWujud = document.querySelectorAll(".wujud");
  var infoWujud = document.getElementById("wujud-info");

  kartuWujud.forEach(function (kartu) {
    kartu.addEventListener("click", function () {
      kartuWujud.forEach(function (lain) {
        lain.setAttribute("aria-pressed", "false");
      });
      kartu.setAttribute("aria-pressed", "true");
      isiKartuInfo(
        infoWujud,
        "",
        kartu.getAttribute("data-judul"),
        kartu.getAttribute("data-info"),
      );
    });
  });

  /* ---------- 5. Kelompokkan Zat ---------- */
  var areaKelompok = document.getElementById("aktivitas-kelompok");
  var pesanBenarK = areaKelompok.getAttribute("data-pesan-benar"); // berisi {nama} dan {wujud}
  var pesanSalahK = areaKelompok.getAttribute("data-pesan-salah");
  var pesanPilihK = areaKelompok.getAttribute("data-pesan-pilih");

  var daftarItem = Array.prototype.slice.call(
    document.querySelectorAll(".item"),
  );
  var daftarZona = Array.prototype.slice.call(
    document.querySelectorAll(".zona"),
  );
  var barisZona = areaKelompok.querySelector(".zona-daftar");
  var hitungKelompok = document.getElementById("hitung-kelompok");
  var skorKelompok = document.getElementById("skor-kelompok");
  var umpanKelompok = document.getElementById("umpan-kelompok");
  var selesaiKelompok = document.getElementById("selesai-kelompok");
  var skorAkhir = document.getElementById("skor-akhir");
  var lencanaKelompok = document.getElementById("lencana-kelompok");

  var totalItem = daftarItem.length;
  var maksSkor = totalItem * 10; // benar pada percobaan pertama = 10 poin
  var jumlahBenarK = 0;
  var skor = 0;
  var itemDipilih = null; // benda yang sedang dipilih dengan klik

  function lepasPilihan() {
    if (itemDipilih) {
      itemDipilih.classList.remove("dipilih");
      itemDipilih.setAttribute("aria-pressed", "false");
    }
    itemDipilih = null;
    barisZona.classList.remove("siap");
  }

  // Menempatkan benda ke sebuah kelompok (dipakai oleh klik dan oleh seret)
  function cobaTempatkan(item, zona) {
    var wujudBenda = item.getAttribute("data-wujud");
    var wujudZona = zona.getAttribute("data-wujud");
    var namaBenda = item.getAttribute("data-nama");

    if (wujudBenda === wujudZona) {
      // BENAR: benda masuk ke kelompok
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent =
        item.querySelector(".item-ikon").textContent + " " + namaBenda;
      zona.querySelector(".zona-isi").appendChild(chip);

      item.hidden = true; // benda hilang dari daftar
      lepasPilihan();

      // Skor: benar pada percobaan pertama = 10, setelah salah = 5
      skor += item.getAttribute("data-salah") === "true" ? 5 : 10;
      skorKelompok.textContent = skor;

      jumlahBenarK++;
      hitungKelompok.textContent =
        "Sudah dikelompokkan: " + jumlahBenarK + " dari " + totalItem;

      var pesan = pesanBenarK
        .replace("{nama}", namaBenda)
        .replace("{wujud}", wujudZona);
      tampilkanPesan(umpanKelompok, pesan, "benar");

      if (jumlahBenarK === totalItem) {
        skorAkhir.textContent =
          "Skor akhir: " + skor + " dari " + maksSkor + ".";
        selesaiKelompok.hidden = false;
        lencanaKelompok.hidden = false;
        kelompokSelesai = true;
        cekSelesai();
      }
    } else {
      // SALAH: benda tetap ada, siswa boleh mencoba kelompok lain
      item.setAttribute("data-salah", "true");
      goyangkan(zona);
      goyangkan(item);
      tampilkanPesan(umpanKelompok, pesanSalahK, "salah");
    }
  }

  // --- Cara 1: klik benda, lalu klik kelompoknya (cocok untuk layar sentuh) ---
  var barusSeret = false; // mencegah "klik" ikut terbaca setelah menyeret

  daftarItem.forEach(function (item) {
    item.setAttribute("aria-pressed", "false");

    item.addEventListener("click", function () {
      if (barusSeret) {
        return;
      }
      // Klik benda yang sama sekali lagi = batal memilih
      if (itemDipilih === item) {
        lepasPilihan();
        return;
      }
      lepasPilihan();
      itemDipilih = item;
      item.classList.add("dipilih");
      item.setAttribute("aria-pressed", "true");
      barisZona.classList.add("siap");
    });
  });

  daftarZona.forEach(function (zona) {
    zona.addEventListener("click", function () {
      if (!itemDipilih) {
        tampilkanPesan(umpanKelompok, pesanPilihK, "info");
        return;
      }
      cobaTempatkan(itemDipilih, zona);
    });
  });

  // --- Cara 2: seret benda dengan mouse (drag-and-drop) ---
  // Layar sentuh memakai Cara 1 supaya halaman tetap bisa digulir dengan jari.
  var seret = null; // data seretan yang sedang berjalan

  function zonaDi(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest(".zona") : null;
  }

  daftarItem.forEach(function (item) {
    item.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch" || event.button !== 0) {
        return;
      }
      seret = {
        item: item,
        ghost: null,
        mulai: false,
        x: event.clientX,
        y: event.clientY,
      };
    });
  });

  document.addEventListener("pointermove", function (event) {
    if (!seret) {
      return;
    }
    if (!seret.mulai) {
      var geserX = event.clientX - seret.x;
      var geserY = event.clientY - seret.y;
      if (Math.sqrt(geserX * geserX + geserY * geserY) < 6) {
        return; // gerakan kecil masih dianggap klik biasa
      }
      // Mulai menyeret: buat salinan benda yang mengikuti kursor
      seret.mulai = true;
      var ghost = seret.item.cloneNode(true);
      ghost.removeAttribute("id");
      ghost.className = "item item-seret";
      ghost.setAttribute("aria-hidden", "true");
      ghost.tabIndex = -1;
      ghost.style.width = seret.item.offsetWidth + "px";
      document.body.appendChild(ghost);
      seret.ghost = ghost;
      seret.item.classList.add("sedang-diseret");
    }
    seret.ghost.style.left = event.clientX + "px";
    seret.ghost.style.top = event.clientY + "px";

    // Beri tanda pada kelompok yang sedang ditunjuk
    var sasaran = zonaDi(event.clientX, event.clientY);
    daftarZona.forEach(function (zona) {
      zona.classList.toggle("sasaran", zona === sasaran);
    });
  });

  function akhiriSeret(event, dibatalkan) {
    if (!seret) {
      return;
    }
    var data = seret;
    seret = null;
    if (!data.mulai) {
      return; // hanya klik biasa
    }
    data.ghost.parentNode.removeChild(data.ghost);
    data.item.classList.remove("sedang-diseret");
    daftarZona.forEach(function (zona) {
      zona.classList.remove("sasaran");
    });

    barusSeret = true;
    setTimeout(function () {
      barusSeret = false;
    }, 80);

    if (!dibatalkan) {
      var zona = zonaDi(event.clientX, event.clientY);
      if (zona && !data.item.hidden) {
        cobaTempatkan(data.item, zona);
      }
    }
  }
  document.addEventListener("pointerup", function (event) {
    akhiriSeret(event, false);
  });
  document.addEventListener("pointercancel", function (event) {
    akhiriSeret(event, true);
  });

  // --- Kelompokkan lagi ---
  document
    .getElementById("ulang-kelompok")
    .addEventListener("click", function () {
      lepasPilihan();
      jumlahBenarK = 0;
      skor = 0;
      kelompokSelesai = false;

      daftarItem.forEach(function (item) {
        item.hidden = false;
        item.removeAttribute("data-salah");
      });
      document.querySelectorAll(".zona-isi").forEach(function (isi) {
        isi.textContent = "";
      });

      hitungKelompok.textContent = "Sudah dikelompokkan: 0 dari " + totalItem;
      skorKelompok.textContent = "0";
      umpanKelompok.textContent = "";
      umpanKelompok.className = "umpan-balik";
      selesaiKelompok.hidden = true;
      lencanaKelompok.hidden = true;
      perbaruiStatus();
    });

  /* ---------- 6. Zat di Sekitar Kita: penghitung sederhana ---------- */
  var jumlahTemuan = 0;
  var angkaTemuan = document.getElementById("jumlah-temuan");
  var infoTemuan = document.getElementById("info-temuan");

  function perbaruiTemuan() {
    angkaTemuan.textContent = jumlahTemuan;
    if (jumlahTemuan === 0) {
      infoTemuan.textContent = "Ketuk + setiap kali kamu menemukan zat.";
    } else {
      infoTemuan.textContent =
        "Kamu menemukan " + jumlahTemuan + " zat. Hebat, Penjelajah Zat! 🌟";
    }
  }
  document
    .getElementById("tambah-temuan")
    .addEventListener("click", function () {
      if (jumlahTemuan < 99) {
        jumlahTemuan++;
        perbaruiTemuan();
      }
    });
  document
    .getElementById("kurang-temuan")
    .addEventListener("click", function () {
      if (jumlahTemuan > 0) {
        jumlahTemuan--;
        perbaruiTemuan();
      }
    });

  /* ---------- 7. Status selesai + simpan progress ----------
     Hutan Zat dianggap selesai jika dua aktivitas utama selesai:
     "Temukan Zat!" dan "Kelompokkan Zat".
     Yang disimpan ke localStorage:
       1) hutanZatCompleted = "true"            (penanda khusus halaman ini)
       2) progress peta lokasi "hutan-zat"       (dipakai halaman Peta) */
  var statusHutan = document.getElementById("status-hutan");

  function perbaruiStatus() {
    if (halamanSelesai) {
      statusHutan.textContent = "🌳 Hutan Zat — ✅ Selesai";
      statusHutan.classList.add("selesai");
    } else {
      var selesai = (temukanSelesai ? 1 : 0) + (kelompokSelesai ? 1 : 0);
      statusHutan.textContent =
        "🌳 Hutan Zat — ⏳ Belum selesai (" +
        selesai +
        " dari 2 aktivitas utama)";
      statusHutan.classList.remove("selesai");
    }
  }

  function simpanPenanda() {
    return ZatopiaStorage.simpan("hutanZatCompleted", true);
  }

  function selesaikanHalaman() {
    var berhasilPeta = ZatopiaProgress.tandaiSelesai(kodeLokasi);
    var berhasilPenanda = simpanPenanda();

    halamanSelesai = true;
    perbaruiStatus();
    tampilkanProgres();

    if (berhasilPeta && berhasilPenanda) {
      ZatopiaToast(
        "🌳 Hutan Zat selesai! Progress petualanganmu sudah disimpan.",
      );
    } else {
      ZatopiaToast(
        "Progress belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!",
      );
    }
  }

  function cekSelesai() {
    perbaruiStatus();
    if (!halamanSelesai && temukanSelesai && kelompokSelesai) {
      selesaikanHalaman();
    }
  }

  // Jika Hutan Zat pernah diselesaikan, statusnya langsung ditampilkan
  var penandaLama = ZatopiaStorage.ambil("hutanZatCompleted", false) === true;
  perbaruiStatus();
  tampilkanProgres();

  /* ---------- 8. Link ke halaman yang belum dibuat ----------
     Dunia Cair dan Dunia Gas dibuat di langkah berikutnya.
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

  document.querySelectorAll("a[data-cek-halaman]").forEach(function (link) {
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
