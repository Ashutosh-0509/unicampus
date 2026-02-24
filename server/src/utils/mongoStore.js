/**
 * MongoDB storage utility.
 * Drop-in replacement for localStore.js — same function signatures.
 * Uses Mongoose models mapped by the original JSON filename.
 */
const { getModel } = require('../models');

/**
 * Read all documents (optionally matching filename).
 * Returns plain JS array (lean).
 */
async function readData(filename, defaultData = []) {
  try {
    const Model = getModel(filename);
    const docs = await Model.find({}).lean();
    return docs.length > 0 ? docs : defaultData;
  } catch (err) {
    console.error(`mongoStore.readData(${filename}):`, err.message);
    return defaultData;
  }
}

/**
 * Replace all documents in a collection with the given array.
 */
async function writeData(filename, data) {
  try {
    const Model = getModel(filename);
    await Model.deleteMany({});
    if (Array.isArray(data) && data.length > 0) {
      await Model.insertMany(data, { ordered: false });
    }
  } catch (err) {
    console.error(`mongoStore.writeData(${filename}):`, err.message);
  }
}

/**
 * Insert a single document.
 */
async function appendData(filename, item) {
  try {
    const Model = getModel(filename);
    const doc = await Model.create(item);
    return doc.toObject();
  } catch (err) {
    console.error(`mongoStore.appendData(${filename}):`, err.message);
    return item;
  }
}

/**
 * Update a document by its `id` field (not _id).
 */
async function updateItem(filename, id, updates) {
  try {
    const Model = getModel(filename);
    const doc = await Model.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, lean: true },
    );
    return doc || null;
  } catch (err) {
    console.error(`mongoStore.updateItem(${filename}):`, err.message);
    return null;
  }
}

/**
 * Delete a document by its `id` field.
 */
async function deleteItem(filename, id) {
  try {
    const Model = getModel(filename);
    const result = await Model.deleteOne({ id });
    return result.deletedCount > 0;
  } catch (err) {
    console.error(`mongoStore.deleteItem(${filename}):`, err.message);
    return false;
  }
}

/**
 * Find a single document by its `id` field.
 */
async function findById(filename, id) {
  try {
    const Model = getModel(filename);
    const doc = await Model.findOne({ id }).lean();
    return doc || null;
  } catch (err) {
    console.error(`mongoStore.findById(${filename}):`, err.message);
    return null;
  }
}

/**
 * Find documents where `field === value`.
 */
async function findByField(filename, field, value) {
  try {
    const Model = getModel(filename);
    return await Model.find({ [field]: value }).lean();
  } catch (err) {
    console.error(`mongoStore.findByField(${filename}):`, err.message);
    return [];
  }
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
