const Product = require('../models/Product');
const mongoose = require('mongoose');

module.exports = {
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = 20; // Fixed limit of 20 products per page
            const skip = (page - 1) * limit; // Calculate offset
    
            const products = await Product.find().skip(skip).limit(limit);
            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);
    
            res.status(200).json({
                products,
                page,
                limit,
                totalProducts,
                totalPages,
            });

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

    searchProducts: async (req, res) => {
        const { name, category, minPrice, maxPrice } = req.query;
        const query = {};
        
        // Name filter (case-insensitive partial match)
        if (name) query.name = { $regex: name, $options: 'i' };
        
        // Category filter
        if (category) query.category = { $regex: category, $options: 'i' };
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice) || 0;
            if (maxPrice) query.price.$lte = Number(maxPrice) || Infinity;
        }
        
        try {
            const products = await Product.find(query);
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error searching products', error });
        }
    }
}