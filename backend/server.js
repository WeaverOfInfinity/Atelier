const express = require('express');
const app = express();

app.use('/auth', require('./src/routes/auth'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});