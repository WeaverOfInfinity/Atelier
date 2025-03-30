## API Documentation ##

### Endpoints ###

#### 1. GET /api/products
- **Description**: Fetch all products with pagination support.
- **Request**:
  - Query Parameter: `page` (optional, integer, default is `1`)
    - Specifies the page number to fetch.
- **Response**:
  - Status: `200 OK`
  - Body: JSON object containing paginated product data.
  - **Example Request**:
    ```
    GET /api/products?page=1
    ```
  - **Example Response**:
    ```json
    {
      "products": [
        {
          "_id": "64f1b2c3d4e5f67890123456",
          "name": "Product A",
          "description": "Description of Product A",
          "price": 29.99,
          "category": "Category A",
          "createdAt": "2023-10-01T12:00:00.000Z",
          "updatedAt": "2023-10-01T12:00:00.000Z"
        },
        {
          "_id": "64f1b2c3d4e5f67890123457",
          "name": "Product B",
          "description": "Description of Product B",
          "price": 49.99,
          "category": "Category B",
          "createdAt": "2023-10-01T12:00:00.000Z",
          "updatedAt": "2023-10-01T12:00:00.000Z"
        }
      ],
      "page": 1,
      "limit": 20,
      "totalProducts": 25,
      "totalPages": 2
    }
    ```
- **Notes**:
  - The default page size is 20 products per page.
  - If the `page` query parameter is not provided, the first page is returned by default.
  - The `totalProducts` field indicates the total number of products in the database.
  - The `totalPages` field indicates the total number of pages available.

#### 2. GET /api/products/{id}
- **Description**: Fetch a single product by its ID.
- **Request**:
  - Path Parameter: `id` (string, valid MongoDB ObjectId)
- **Response**:
  - Status: `200 OK`
  - Body: JSON object of the product.
  - **Example**:
    ```json
    {
      "_id": "64f1b2c3d4e5f67890123456",
      "name": "Product A",
      "description": "Description of Product A",
      "price": 29.99,
      "category": "Category A",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    }
    ```
  - Status: `400 Bad Request` if the ID is invalid.
    - **Example**:
      ```json
      {
        "message": "Invalid product ID"
      }
      ```
  - Status: `404 Not Found` if the product does not exist.
    - **Example**:
      ```json
      {
        "message": "Product not found"
      }
      ```

#### 3. GET /api/products/category/:category
- **Description**: Fetch all products belonging to a specific category.
- **Request**:
  - Path Parameter: `category` (string, name of the category)
- **Response**:
  - Status: `200 OK`
  - Body: JSON array of product objects in the specified category.
  - **Example Request**:
    ```
    GET /api/products/category/Category A
    ```
  - **Example Response**:
    ```json
    [
      {
        "_id": "64f1b2c3d4e5f67890123456",
        "name": "Product A",
        "description": "Description of Product A",
        "price": 29.99,
        "category": "Category A",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
      },
      {
        "_id": "64f1b2c3d4e5f67890123457",
        "name": "Product B",
        "description": "Description of Product B",
        "price": 49.99,
        "category": "Category A",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
      }
    ]
    ```
  - Status: `404 Not Found` if no products are found in the specified category.
    - **Example**:
      ```json
      {
        "message": "No products found in this category"
      }
      ```
  - Status: `500 Internal Server Error` if an error occurs.

- **Note**: If no category is specified (e.g., `/api/products/category/`), the request will redirect to `/api/products`, which returns all products.

#### 4. GET /api/products/search
- **Description**: Search for products based on various criteria.
- **Request**:
  - Query Parameters (all optional):
    - `name` (string): Search for products with names matching this value (case-insensitive).
    - `category` (string): Search for products in a specific category (case-insensitive).
    - `minPrice` (number): Minimum price of the products.
    - `maxPrice` (number): Maximum price of the products.
  - **Example Request**:
    ```
    GET /api/products/search?name=Product&category=Category A&minPrice=50&maxPrice=150
    ```
- **Response**:
  - Status: `200 OK`
  - Body: JSON array of product objects matching the search criteria.
  - **Example Response**:
    ```json
    [
      {
        "_id": "64f1b2c3d4e5f67890123456",
        "name": "Product A",
        "description": "Description of Product A",
        "price": 100,
        "category": "Category A",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
      }
    ]
    ```
  - Status: `500 Internal Server Error` if an error occurs.

#### 5. POST /api/products
- **Description**: Create a new product.
- **Request**:
  - Body (JSON):
    - `name` (string, required): The name of the product.
    - `description` (string, optional): A description of the product.
    - `price` (number, required): The price of the product.
    - `category` (string, required): The category of the product.
  - **Example Request**:
    ```json
    {
      "name": "New Product",
      "description": "New Description",
      "price": 150,
      "category": "New Category"
    }
    ```
- **Response**:
  - Status: `201 Created`
  - Body: JSON object of the newly created product.
  - **Example Response**:
    ```json
    {
      "_id": "64f1b2c3d4e5f67890123458",
      "name": "New Product",
      "description": "New Description",
      "price": 150,
      "category": "New Category",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    }
    ```
  - Status: `400 Bad Request` if required fields are missing.
    - **Example**:
      ```json
      {
        "message": "Name is required"
      }
      ```
  - Status: `500 Internal Server Error` if an error occurs.

