const express = require('express');
const dbConnect = require('./config/dbConfig').dbConnect;
const dotenv = require('dotenv');
const app = express();
const productRouter = require('./routes/productRouter');

app.use(express.json());
app.use('/products', productRouter);


if (require.main === module) {
  dbConnect();

  app.listen(5000, () => {
    console.log('Server is running on port 5000...');
  });
}

module.exports = app; // Export the app for testing purposes