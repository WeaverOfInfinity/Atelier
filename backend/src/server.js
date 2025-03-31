const express = require('express');
const dbConnect = require('./config/dbConfig').dbConnect;
const dotenv = require('dotenv');
const app = express();
const productRouter = require('./routes/productRouter');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: false, // If sending cookies or auth headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Sanitize user input to prevent NoSQL injection attacks

app.use('/products', productRouter);


if (require.main === module) {
  dbConnect();

  app.listen(5000, () => {
    console.log('Server is running on port 5000...');
  });
}

module.exports = app; // Export the app for testing purposes