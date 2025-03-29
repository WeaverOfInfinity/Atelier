const Product = require('../models/Product');
const mongoose = require('mongoose');

module.exports = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID'});
        } 
        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching product', error });
        }
    },

    getProductsByCategory: async (req, res) => {
        const { category } = req.params;
        try {
            const products = await Product.$where(`this.category == "${category}"`);
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found in this category' });
            }
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products by category', error });
        }
    },
}