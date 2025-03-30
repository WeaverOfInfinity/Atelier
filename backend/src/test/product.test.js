const { connectDB, closeDB, clearDB } = require('../utils/testHandler');
const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const { faker } = require('@faker-js/faker');

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
        expect(response.body.products.length).toBe(2);
        expect(response.body.products[0].name).toBe('Product 1');
        expect(response.body.products[1].name).toBe('Product 2');
    });


    test('GET /products - should support pagination', async () => {
        // Create 25 test products using a for loop and Faker
        const totalProducts = 25;
        for (let i = 0; i < totalProducts; i++) {
            const product = new Product({
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                price: faker.commerce.price(),
                category: faker.commerce.department()
            });
            await product.save();
        }
        
        // Test first page (default)
        const response1 = await request(app).get('/products');

        expect(response1.statusCode).toBe(200);
        expect(response1.body.products.length).toBe(20); // Assuming 20 per page
        expect(response1.body.page).toBe(1);
        expect(response1.body.totalPages).toBe(2);
        expect(response1.body.totalProducts).toBe(totalProducts);
        
        // Test second page explicitly
        const response2 = await request(app).get('/products?page=2');
        expect(response2.statusCode).toBe(200);
        expect(response2.body.products.length).toBe(5); // 25 total, 20 on first page, 5 on second
        expect(response2.body.page).toBe(2);
        expect(response2.body.totalPages).toBe(2);
        expect(response2.body.totalProducts).toBe(totalProducts);
        
        // Check that the products on page 2 are different from page 1
        const page1Ids = response1.body.products.map(p => p._id);
        const page2Ids = response2.body.products.map(p => p._id);
        
        // Ensure no overlap between pages
        const overlap = page1Ids.filter(id => page2Ids.includes(id));
        expect(overlap.length).toBe(0);
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


    test('GET /products/category/:category - should redirect if no category is provided', async () => {
        const product1 = new Product({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
        const product2 = new Product({ name: 'Product 2', description: 'Description 2', price: 200, category: 'Category 1' });
        await product1.save();
        await product2.save();
        
        const response = await request(app).get('/products/category/');
        expect(response.statusCode).toBe(302); // Check for redirect status code
        expect(response.headers.location).toBe('/products'); // Check redirect location
    });


    test('GET /products/search - should return products based on search criteria', async () => {
        const product1 = new Product({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
        const product2 = new Product({ name: 'Product 2', description: 'Description 2', price: 200, category: 'Category 2' });
        await product1.save();
        await product2.save();

        const response = await request(app).get('/products/search')
                .query({ name: 'Product', category: 'Category 1', minPrice: 50, maxPrice: 150 });

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('Product 1');
    });


    test('POST /products - should create a new product', async () => {
        const newProduct = {
            name: 'New Product',
            description: 'New Description',
            price: 150,
            category: 'New Category'
        };
        const response = await request(app).post('/products').send(newProduct);

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe('New Product');
    });

    test('POST /products - should return 400 if required fields are missing', async () => {
        // Test for missing name field
        const newProduct = {
            description: 'New Description',
            price: 150,
            category: 'New Category'
        };
        const response = await request(app).post('/products').send(newProduct);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Name is required');

        // Test for missing price field
        const newProduct2 = {
            name: 'New Product',
            description: 'New Description',
            category: 'New Category'
        };
        const response2 = await request(app).post('/products').send(newProduct2);

        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('Price is required');

        // Test for missing category field
        const newProduct3 = {
            name: 'New Product',
            description: 'New Description',
            price: 150
        };
        const response3 = await request(app).post('/products').send(newProduct3);

        expect(response3.statusCode).toBe(400);
        expect(response3.body.message).toBe('Category is required');
    });


    test('PUT /products/:id - should update an existing product', async () => {
        const product = new Product({
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'Category 1'
        });
        await product.save();

        const updatedProduct = {
            name: 'Updated Product',
            description: 'Updated Description',
            price: 150,
            category: 'Updated Category'
        };
       
        const response = await request(app).put(`/products/${product._id}`).send(updatedProduct);

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Updated Product');
    });


    test('PUT /products/:id - should return 400 if required fields are invalid', async () => {
        const product = new Product({
            name: 'Product 1',
            description: 'Description 1',
            price: 45,
            category: 'Category 1'
        });

        await product.save();

        const updatedProduct = {
            name: '', // Invalid name
            description: 'Updated Description',
            price: 45,
            category: 'Updated Category'
        };

        const response = await request(app).put(`/products/${product._id}`).send(updatedProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Name cannot be empty');

        // Test for invalid price
        const updatedProduct2 = {
            name: 'Updated Product',
            description: 'Updated Description',
            price: -10, // Invalid price
            category: 'Updated Category'
        };
        const response2 = await request(app).put(`/products/${product._id}`).send(updatedProduct2);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.message).toBe('Price must be a positive number');
    });
});