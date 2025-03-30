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
    
           return res.status(200).json({
                products,
                page,
                limit,
                totalProducts,
                totalPages,
            });

        } catch (error) {
            return res.status(500).json({ message: 'Error fetching products', error });
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
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching product', error });
        }
    },

    getProductsByCategory: async (req, res) => {
        const { category } = req.params;
        try {
            const products = await Product.$where(`this.category == "${category}"`);
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found in this category' });
            }
           return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching products by category', error });
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
            return res.status(200).json(products);
        } catch (error) {
           return res.status(500).json({ message: 'Error searching products', error });
        }
    },

    createProduct: async (req, res) => {
        const { name, description, price, category } = req.body;
        if (!name)return res.status(400).json({ message: 'Name is required' });
        if (!price) return res.status(400).json({ message: 'Price is required' });
        if (!category) return res.status(400).json({ message: 'Category is required' });
        
        try {
            const newProduct = new Product({ name, description, price, category });
            await newProduct.save();
            return res.status(201).json(newProduct);
        } catch (error) {
            return res.status(500).json({ message: 'Error creating product', error });
        }
    },
}