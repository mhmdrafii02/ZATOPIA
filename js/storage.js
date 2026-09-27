/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/storage.js
   Satu-satunya tempat yang mengurus localStorage.
   Semua halaman memakai fungsi ini supaya data siswa
   (nama, avatar, progress, skor, badge) tidak bentrok.

   Cara pakai di halaman lain:
     ZatopiaStorage.simpan("nama", "Rafi");
     var nama = ZatopiaStorage.ambil("nama", "");

   Kunci (nama data) yang dipakai ZATOPIA:
     "nama"      -> nama siswa (teks)
     "avatar"    -> "zaki" atau "zara"
     "progress"  -> lokasi peta yang sudah selesai (lihat ZatopiaProgress di bawah)
     "skor"      -> akan dipakai di halaman berikutnya
     "badge"     -> akan dipakai di halaman berikutnya
   ===================================================== */

var ZatopiaStorage = {
  // Awalan supaya data ZATOPIA tidak tercampur dengan website lain
  awalan: "zatopia_",

  // Simpan data. Mengembalikan true jika berhasil, false jika gagal.
  simpan: function (kunci, nilai) {
    try {
      localStorage.setItem(this.awalan + kunci, JSON.stringify(nilai));
      return true;
    } catch (galat) {
      return false; // misalnya penyimpanan browser diblokir
    }
  },

  // Ambil data. Jika belum ada, hasilnya adalah nilai "cadangan".
  ambil: function (kunci, cadangan) {
    try {
      var tersimpan = localStorage.getItem(this.awalan + kunci);
      if (tersimpan === null) {
        return cadangan;
      }
      return JSON.parse(tersimpan);
    } catch (galat) {
      return cadangan;
    }
  },

  // Hapus satu data
  hapus: function (kunci) {
    try {
      localStorage.removeItem(this.awalan + kunci);
    } catch (galat) {
      // abaikan
    }
  },
};

/* =====================================================
   PROGRESS PETUALANGAN
   Mencatat lokasi peta mana saja yang sudah selesai.
   Data disimpan di localStorage dengan kunci "progress".

   Cara memakai di halaman lain (contoh: di akhir halaman Dunia Padat):
     ZatopiaProgress.tandaiSelesai("gunung-es");

   Kode lokasi (urut sesuai jalur peta):
     "hutan-zat"         Hutan Zat
     "gunung-es"         Gunung Es (wujud padat)
     "danau-cair"        Danau Cair (wujud cair)
     "negeri-uap"        Negeri Uap (wujud gas)
     "laboratorium"      Laboratorium
     "zona-eksperimen"   Zona Eksperimen
     "arena-game"        Arena Game
     "misi-akhir"        Misi Akhir (evaluasi)
     "balai-penghargaan" Balai Penghargaan
   ===================================================== */

var ZatopiaProgress = {
  // Daftar lokasi berurutan (sama dengan urutan jalur di peta)
  LOKASI: [
    "hutan-zat",
    "gunung-es",
    "danau-cair",
    "negeri-uap",
    "laboratorium",
    "zona-eksperimen",
    "arena-game",
    "misi-akhir",
    "balai-penghargaan",
  ],

  // Ambil semua data progress, bentuknya: { "hutan-zat": true, ... }
  ambilSemua: function () {
    var data = ZatopiaStorage.ambil("progress", {});
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data;
    }
    return {};
  },

  // Apakah lokasi ini sudah selesai? (true / false)
  sudahSelesai: function (kode) {
    return this.ambilSemua()[kode] === true;
  },

  // Tandai lokasi sebagai selesai. Mengembalikan true jika berhasil disimpan.
  tandaiSelesai: function (kode) {
    if (this.LOKASI.indexOf(kode) === -1) {
      return false; // kode lokasi tidak dikenal
    }
    var data = this.ambilSemua();
    data[kode] = true;
    return ZatopiaStorage.simpan("progress", data);
  },

  // Jumlah lokasi yang sudah selesai
  jumlahSelesai: function () {
    var jumlah = 0;
    for (var i = 0; i < this.LOKASI.length; i++) {
      if (this.sudahSelesai(this.LOKASI[i])) {
        jumlah++;
      }
    }
    return jumlah;
  },

  // Progress dalam persen (0 sampai 100)
  hitungPersen: function () {
    return Math.round((this.jumlahSelesai() / this.LOKASI.length) * 100);
  },

  // Kosongkan progress (untuk pengujian)
  reset: function () {
    ZatopiaStorage.hapus("progress");
  },
};

/* =====================================================
   SKOR PERMAINAN
   Mencatat jumlah jawaban benar & salah di halaman
   Arena Game. Disimpan di localStorage dengan kunci "skor".

   Cara memakai di halaman lain:
     ZatopiaSkor.tambahBenar();
     ZatopiaSkor.tambahSalah();
     var skor = ZatopiaSkor.ambil(); // { benar: 0, salah: 0 }
   ===================================================== */

var ZatopiaSkor = {
  // Ambil skor saat ini. Jika belum ada, hasilnya { benar: 0, salah: 0 }.
  ambil: function () {
    var data = ZatopiaStorage.ambil("skor", { benar: 0, salah: 0 });
    if (data && typeof data === "object") {
      return {
        benar: typeof data.benar === "number" ? data.benar : 0,
        salah: typeof data.salah === "number" ? data.salah : 0,
      };
    }
    return { benar: 0, salah: 0 };
  },

  // Tambah 1 ke jumlah jawaban benar
  tambahBenar: function () {
    var skor = this.ambil();
    skor.benar++;
    ZatopiaStorage.simpan("skor", skor);
    return skor;
  },

  // Tambah 1 ke jumlah jawaban salah
  tambahSalah: function () {
    var skor = this.ambil();
    skor.salah++;
    ZatopiaStorage.simpan("skor", skor);
    return skor;
  },

  // Kosongkan skor (untuk pengujian, atau saat mulai ulang)
  reset: function () {
    ZatopiaStorage.hapus("skor");
  },
};

/* =====================================================
   HASIL EVALUASI
   Menyimpan skor evaluasi akhir (Misi Akhir), supaya bisa
   ditampilkan lagi di hasil.html.
   ===================================================== */

var ZatopiaEvaluasi = {
  // Simpan hasil evaluasi. Mengembalikan true jika berhasil disimpan.
  simpanHasil: function (benar, total) {
    return ZatopiaStorage.simpan("evaluasi", {
      benar: benar,
      total: total,
      waktu: Date.now(),
    });
  },

  // Ambil hasil evaluasi terakhir. null jika belum pernah mengerjakan.
  ambilHasil: function () {
    return ZatopiaStorage.ambil("evaluasi", null);
  },

  // Kosongkan hasil evaluasi (untuk pengujian, atau saat mulai ulang)
  reset: function () {
    ZatopiaStorage.hapus("evaluasi");
  },
};
