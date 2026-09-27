/* =====================================================
   ZATOPIA - Petualangan Dunia Zat
   File: js/identitas.js
   Halaman 2: Identitas Siswa.
   Tugas: validasi nama, simpan nama & avatar ke
   localStorage (lewat js/storage.js), lalu menuju peta.html.
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Pengaturan ---------- */
  var HALAMAN_PETA = "peta.html"; // halaman tujuan setelah menekan MULAI

  // Data karakter dan sapaannya
  var KARAKTER = {
    zaki: "Halo! Aku Zaki, temanmu menjelajah!",
    zara: "Halo! Aku Zara, ayo kita berpetualang bersama!",
  };

  /* ---------- Elemen di halaman ---------- */
  var form = document.getElementById("form-identitas");
  var inputNama = document.getElementById("input-nama");
  var pesanForm = document.getElementById("pesan-form");
  var sapaan = document.getElementById("sapaan-karakter");
  var daftarAvatar = document.querySelectorAll('input[name="avatar"]');

  /* ---------- Fungsi bantu ---------- */

  // Tampilkan pesan ramah. jenis: "peringatan" (kuning) atau "info" (biru)
  function tampilkanPesan(teks, jenis) {
    pesanForm.textContent = teks;
    pesanForm.className =
      "pesan-form" + (jenis === "info" ? " pesan-info" : "");
  }

  function hapusPesan() {
    pesanForm.textContent = "";
    pesanForm.className = "pesan-form";
    inputNama.classList.remove("input-salah");
  }

  // Avatar yang sedang dipilih ("zaki", "zara", atau "" jika belum memilih)
  function avatarTerpilih() {
    for (var i = 0; i < daftarAvatar.length; i++) {
      if (daftarAvatar[i].checked) {
        return daftarAvatar[i].value;
      }
    }
    return "";
  }

  // Pilih avatar lewat kode (dipakai saat mengisi ulang data lama)
  function pilihAvatar(nilai) {
    for (var i = 0; i < daftarAvatar.length; i++) {
      daftarAvatar[i].checked = daftarAvatar[i].value === nilai;
    }
  }

  function tampilkanSapaan(nilai) {
    sapaan.textContent = KARAKTER[nilai] || "";
  }

  /* ---------- 1. Isi ulang jika siswa pernah mengisi ---------- */
  var namaLama = ZatopiaStorage.ambil("nama", "");
  var avatarLama = ZatopiaStorage.ambil("avatar", "");

  if (typeof namaLama === "string" && namaLama !== "") {
    inputNama.value = namaLama;
  }
  if (KARAKTER[avatarLama]) {
    pilihAvatar(avatarLama);
    tampilkanSapaan(avatarLama);
  }

  /* ---------- 2. Interaksi ---------- */

  // Saat avatar dipilih: tampilkan sapaan karakter
  daftarAvatar.forEach(function (radio) {
    radio.addEventListener("change", function () {
      tampilkanSapaan(radio.value);
      hapusPesan();
    });
  });

  // Saat mengetik nama: pesan lama dihapus
  inputNama.addEventListener("input", hapusPesan);

  /* ---------- 3. Tombol MULAI ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // cegah halaman dimuat ulang

    // Rapikan nama: hapus spasi di awal/akhir dan spasi ganda
    var nama = inputNama.value.replace(/\s+/g, " ").trim();
    var avatar = avatarTerpilih();

    // Validasi 1: nama tidak boleh kosong
    if (nama === "") {
      inputNama.classList.add("input-salah");
      tampilkanPesan(
        "Yuk tuliskan namamu terlebih dahulu, Penjelajah!",
        "peringatan",
      );
      inputNama.focus();
      return;
    }

    // Validasi 2: avatar harus dipilih
    if (avatar === "") {
      tampilkanPesan(
        "Pilih dulu Zaki atau Zara sebagai temanmu, Penjelajah!",
        "peringatan",
      );
      return;
    }

    // Simpan ke localStorage
    var berhasilNama = ZatopiaStorage.simpan("nama", nama);
    var berhasilAvatar = ZatopiaStorage.simpan("avatar", avatar);

    if (!berhasilNama || !berhasilAvatar) {
      tampilkanPesan(
        "Datamu belum bisa disimpan. Coba buka ZATOPIA lewat Live Server ya!",
        "peringatan",
      );
      return;
    }

    // Menuju halaman Peta
    menujuPeta(nama);
  });

  /* ---------- 4. Menuju halaman Peta ----------
     Halaman Peta (Halaman 3) belum dibuat. Supaya siswa tidak melihat
     halaman error 404, kode ini memeriksa dulu apakah peta.html ada.
       - Jika ada    -> langsung pindah ke peta.html
       - Jika belum  -> tampilkan pesan bahwa data sudah tersimpan
     Setelah peta.html dibuat, tidak ada yang perlu diubah di sini. */
  function menujuPeta(nama) {
    fetch(HALAMAN_PETA, { method: "HEAD" })
      .then(function (respon) {
        if (respon.ok) {
          window.location.href = HALAMAN_PETA;
        } else {
          tampilkanPesan(
            "Datamu sudah tersimpan, " +
              nama +
              "! Peta ZATOPIA sedang disiapkan.",
            "info",
          );
        }
      })
      .catch(function () {
        // Jika pemeriksaan tidak bisa dilakukan (misalnya file dibuka tanpa Live Server),
        // tetap coba pindah halaman.
        window.location.href = HALAMAN_PETA;
      });
  }
});
