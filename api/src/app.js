import express from 'express';
import dotenv from 'dotenv';

export const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to the Atelier API!');
});

