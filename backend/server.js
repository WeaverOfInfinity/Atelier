const express = require('express');
const dbConnect = require('./src/config/dbConfig').dbConnect;
const dotenv = require('dotenv');
const app = express();

// app.use('/auth', require('./src/routes/authRouter'));


if (require.main === module) {
  dbConnect();

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

module.exports = app; // Export the app for testing purposes