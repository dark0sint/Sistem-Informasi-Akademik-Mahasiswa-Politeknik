/**
 * Layer database sederhana berbasis file JSON.
 * Dipilih agar aplikasi mudah dijalankan di server manapun tanpa
 * proses compile native module (cocok untuk deployment cepat).
 * Untuk skala produksi besar, ganti layer ini dengan PostgreSQL/MySQL
 * (struktur fungsi CRUD di bawah bisa dipertahankan sebagai kontrak).
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function defaultData() {
  return {
    sequences: {},
    users: [],
    mahasiswa: [],
    dosen: [],
    matakuliah: [],
    kelas: [],
    krs: [],
    nilai: [],
    tagihan: [],
    pembayaran: [],
    bimbingan: [],
    kkn_kp: [],
    tugas_akhir: [],
    pengumuman: [],
    notifikasi: [],
    riwayat_status: []
  };
}

let cache = null;

function ensureFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData(), null, 2));
  }
}

function load() {
  if (cache) return cache;
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  cache = JSON.parse(raw);
  // pastikan semua koleksi ada walau file lama
  const def = defaultData();
  for (const key of Object.keys(def)) {
    if (!(key in cache)) cache[key] = def[key];
  }
  return cache;
}

function persist() {
  fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

function nextId(collection) {
  const data = load();
  if (!data.sequences[collection]) data.sequences[collection] = 0;
  data.sequences[collection] += 1;
  return data.sequences[collection];
}

/** Ambil seluruh isi koleksi (array). */
function all(collection) {
  return load()[collection];
}

/** Cari satu row berdasarkan predicate. */
function findOne(collection, predicate) {
  return load()[collection].find(predicate);
}

/** Filter banyak row berdasarkan predicate. */
function findMany(collection, predicate) {
  return load()[collection].filter(predicate);
}

/** Insert row baru, otomatis diberi id. Return row yang sudah tersimpan. */
function insert(collection, row) {
  const data = load();
  const id = nextId(collection);
  const record = { id, ...row };
  data[collection].push(record);
  persist();
  return record;
}

/** Update row berdasarkan id, merge field yang diberikan. */
function updateById(collection, id, patch) {
  const data = load();
  const idx = data[collection].findIndex((r) => r.id === id);
  if (idx === -1) return null;
  data[collection][idx] = { ...data[collection][idx], ...patch };
  persist();
  return data[collection][idx];
}

/** Hapus row berdasarkan id. Return true jika terhapus. */
function removeById(collection, id) {
  const data = load();
  const before = data[collection].length;
  data[collection] = data[collection].filter((r) => r.id !== id);
  const removed = data[collection].length < before;
  if (removed) persist();
  return removed;
}

/** Replace seluruh data (dipakai oleh seeder). */
function resetAll(newData) {
  ensureFile();
  cache = newData;
  persist();
}

module.exports = {
  all,
  findOne,
  findMany,
  insert,
  updateById,
  removeById,
  resetAll,
  load
};
