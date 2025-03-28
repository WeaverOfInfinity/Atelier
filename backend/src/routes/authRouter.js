const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

router.post('/login', await login);

router.post('/register', register);
