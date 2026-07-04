const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  // Detect placeholder URI — don't even bother trying
  const isPlaceholder = !uri || uri.includes('xxxxx') || uri.includes('<password>') || uri.includes('cluster0.xxxxx');

  if (!isPlaceholder) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('✓ MongoDB Atlas connected successfully.');
      global.useFallbackDb = false;
      return;
    } catch (err) {
      console.warn('⚠ Atlas connection failed:', err.message);
    }

    // Try local MongoDB
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/alumniconnect', { serverSelectionTimeoutMS: 2000 });
      console.log('✓ Local MongoDB connected successfully.');
      global.useFallbackDb = false;
      return;
    } catch (err) {
      console.warn('⚠ Local MongoDB also failed:', err.message);
    }
  } else {
    console.warn('⚠ MongoDB URI appears to be a placeholder. Skipping Atlas/local connection.');
  }

  // Fall through to JSON file database
  console.log('✓ Using local JSON file database (data_store.json). All data will persist locally.');
  global.useFallbackDb = true;
};

module.exports = connectDB;
