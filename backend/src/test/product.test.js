const { connectDB, closeDB, clearDB } = require('../utils/testHandler');
const request = require('supertest');
const app = require('../../server');
const Product = require('../models/Product');

beforeAll(async () => {
    await connectDB();
});

afterEach(async () => {
    await clearDB();
});

afterAll(async () => {
    await closeDB();
});

describe('Product API', () => {

    test('GET /products - should return all products', async () => {
        const product1 = new Product({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
        const product2 = new Product({ name: 'Product 2', description: 'Description 2', price: 200, category: 'Category 2' });
        await product1.save();
        await product2.save();

        const response = await request(app).get('/products');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].name).toBe('Product 1');
        expect(response.body[1].name).toBe('Product 2');
    });

    test('GET /products/:id - should return a single product', async () => {
        const product = new Product({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
        await product.save();

        const response = await request(app).get(`/products/${product._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Product 1');
    });

    test('GET /products/category/:category - should return products by category', async () => {
        const product1 = new Product({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
        const product2 = new Product({ name: 'Product 2', description: 'Description 2', price: 200, category: 'Category 1' });
        await product1.save();
        await product2.save();

        const response = await request(app).get('/products/category/Category 1');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].name).toBe('Product 1');
        expect(response.body[1].name).toBe('Product 2');
    });
});