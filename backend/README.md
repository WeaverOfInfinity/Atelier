## API Documentation ##

### Endpoints ###

#### 1. GET /api/products
- **Description**: Fetch all products.
- **Response**:
  - Status: `200 OK`
  - Body: JSON array of product objects.
  - **Example**:
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
        "category": "Category B",
        "createdAt": "2023-10-01T12:00:00.000Z",
        "updatedAt": "2023-10-01T12:00:00.000Z"
      }
    ]
    ```

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

