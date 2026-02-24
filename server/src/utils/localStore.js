/**
 * Local JSON file storage utility.
 * Reads/writes JSON files in the /data directory.
 * Will be replaced with MongoDB models later.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function ensureFile(filename, defaultData = []) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
  return filePath;
}

function readData(filename, defaultData = []) {
  const filePath = ensureFile(filename, defaultData);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function writeData(filename, data) {
  const filePath = ensureFile(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function appendData(filename, item) {
  const data = readData(filename, []);
  data.push(item);
  writeData(filename, data);
  return item;
}

function updateItem(filename, id, updates) {
  const data = readData(filename, []);
  const index = data.findIndex(item => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates };
  writeData(filename, data);
  return data[index];
}

function deleteItem(filename, id) {
  const data = readData(filename, []);
  const filtered = data.filter(item => item.id !== id);
  if (filtered.length === data.length) return false;
  writeData(filename, filtered);
  return true;
}

function findById(filename, id) {
  const data = readData(filename, []);
  return data.find(item => item.id === id) || null;
}

function findByField(filename, field, value) {
  const data = readData(filename, []);
  return data.filter(item => item[field] === value);
}

module.exports = {
  readData,
  writeData,
  appendData,
  updateItem,
  deleteItem,
  findById,
  findByField,
};
