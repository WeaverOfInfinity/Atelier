const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getProductsByCategory } = require('../controllers/productController');

router.get('/', getAllProducts);

router.get('/category/', (req, res) => {
    return res.redirect('/products')
});

router.get('/category', (req, res) => {
    return res.redirect('/products')
});

router.get('/category/:category', getProductsByCategory);

router.get('/:id', getProductById);


module.exports = router;