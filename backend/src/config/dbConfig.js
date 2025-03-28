const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
  url: process.env.DB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

const dbConnect = () => {
  mongoose.connect(dbConfig.url, dbConfig.options)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

module.exports = { dbConfig, dbConnect };