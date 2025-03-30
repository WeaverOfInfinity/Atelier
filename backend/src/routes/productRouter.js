const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);

router.get('/category/', (req, res) => {
    return res.redirect('/products')
});

router.get('/category', (req, res) => {
    return res.redirect('/products')
});

router.get('/category/:category', productController.getProductsByCategory);

router.get('/search', productController.searchProducts);

router.get('/:id', productController.getProductById);

router.post('/', productController.createProduct);

router.put('/:id', productController.updateProduct);

module.exports = router;