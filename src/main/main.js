const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname, '../../db');
const DB_PATH = path.join(DB_DIR, 'app.db');

function ensureDirs() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}
ensureDirs();

const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      service TEXT,
      details TEXT,
      created_at TEXT
    )`);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('getCustomers', async (e, searchTerm) => {
  return await new Promise((resolve) => {
    let q = "SELECT * FROM customers";
    let params = [];
    if (searchTerm && searchTerm.trim()) {
      q += ` WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR details LIKE ?`;
      for (let i = 0; i < 5; i++) params.push('%' + searchTerm + '%');
    }
    q += " ORDER BY id DESC";
    db.all(q, params, (err, rows) => resolve(rows || []));
  });
});

ipcMain.handle('getCustomer', async (e, id) => {
  return await new Promise((resolve) => {
    db.get("SELECT * FROM customers WHERE id = ?", [id], (err, row) => resolve(row));
  });
});

ipcMain.handle('saveCustomer', async (e, data) => {
  if (data.id) {
    return await new Promise((resolve) => {
      db.run(
        `UPDATE customers SET name=?, email=?, phone=?, service=?, details=? WHERE id=?`,
        [data.name, data.email, data.phone, data.service, data.details, data.id],
        function(err) {
          resolve({ success: !err, updated: true });
        }
      );
    });
  } else {
    return await new Promise((resolve) => {
      db.run(
        `INSERT INTO customers (name, email, phone, service, details, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [data.name, data.email, data.phone, data.service, data.details, new Date().toISOString()],
        function(err) {
          resolve({ success: !err, updated: false });
        }
      );
    });
  }
});

ipcMain.handle('deleteCustomer', async (e, id) => {
  return await new Promise((resolve) => {
    db.run(`DELETE FROM customers WHERE id=?`, [id], function(err) {
      resolve({ success: !err });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});