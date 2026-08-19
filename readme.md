# Order & Inventory Management API

Backend API for managing users, products, inventory, and customer orders.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

---

# 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/order_inventory"
JWT_SECRET="your_super_secret_key"
PORT=5000
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Create the ADMIN account:

```bash
npx tsx prisma/seed.ts
```

Start development server:

```bash
npm run dev
```

Server:

```text
http://localhost:5000
```

---

# 2. Authentication

The application uses JWT authentication.

After successful login, the API returns a JWT token.

For protected APIs, send the token using:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

There are two roles:

```text
CUSTOMER
ADMIN
```

---

# 3. API Response Format

Successful responses generally follow:

```json
{
  "success": true,
  "data": {}
}
```

Error responses generally follow:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# 4. Authentication APIs

## 4.1 Register Customer

### Endpoint

```http
POST http://localhost:5000/api/auth/register
```

### Authentication

Not required.

### Request Body

```json
{
  "name": "Prakash",
  "email": "prakash@test.com",
  "password": "password123"
}
```

### How it works

1. The API receives name, email and password.
2. It checks whether the email already exists.
3. The password is hashed using bcrypt.
4. The user is stored in PostgreSQL.
5. A JWT token is generated.
6. The user information and token are returned.

The password is never stored as plain text.

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Prakash",
      "email": "prakash@test.com",
      "role": "CUSTOMER"
    },
    "token": "JWT_TOKEN"
  }
}
```

### Duplicate Email

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

# 5. Login

## 5.1 Customer/Admin Login

### Endpoint

```http
POST http://localhost:5000/api/auth/login
```

### Authentication

Not required.

### Request Body

```json
{
  "email": "prakash@test.com",
  "password": "password123"
}
```

### How it works

1. Find the user using email.
2. Compare the supplied password with the bcrypt hash.
3. If valid, generate a JWT.
4. JWT contains:
   - userId
   - role

5. Return user information and JWT.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Prakash",
      "email": "prakash@test.com",
      "role": "CUSTOMER"
    },
    "token": "JWT_TOKEN"
  }
}
```

### Invalid Credentials

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

# 6. ADMIN Account

ADMIN is created using seed data instead of public registration.

Seed command:

```bash
npx tsx prisma/seed.ts
```

Default seed credentials:

```text
Email: admin@test.com
Password: admin123
Role: ADMIN
```

Login:

```http
POST http://localhost:5000/api/auth/login
```

```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

The returned JWT can be used for ADMIN-only APIs.

---

# 7. Product APIs

Products contain:

```text
id
name
price
stock
active
createdAt
```

---

# 8. Create Product

Only ADMIN can create products.

### Endpoint

```http
POST http://localhost:5000/api/products
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Headers

```text
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Laptop",
  "price": 50000,
  "stock": 10
}
```

### How it works

1. JWT is verified.
2. User role is checked.
3. API validates name, price and stock.
4. Product is inserted into PostgreSQL.
5. Created product is returned.

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "price": "50000",
    "stock": 10,
    "active": true,
    "createdAt": "2026-08-19T15:00:00.000Z"
  }
}
```

### Customer Trying to Create Product

```http
403 Forbidden
```

```json
{
  "success": false,
  "message": "You are not authorized to access this resource"
}
```

---

# 9. Get Active Products

Customers and ADMINs can view active products.

### Endpoint

```http
GET http://localhost:5000/api/products
```

### Authentication

Required.

### Request Headers

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

### How it works

The API queries:

```text
active = true
```

Only active products are returned.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "price": "50000",
      "stock": 10,
      "active": true,
      "createdAt": "2026-08-19T15:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Keyboard",
      "price": "2000",
      "stock": 25,
      "active": true,
      "createdAt": "2026-08-19T15:05:00.000Z"
    }
  ]
}
```

---

# 10. Update Product

Only ADMIN can update product information.

### Endpoint

```http
PATCH http://localhost:5000/api/products/:id
```

Example:

```http
PATCH http://localhost:5000/api/products/1
```

### Headers

```text
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Gaming Laptop",
  "price": 75000,
  "active": true
}
```

All fields are optional.

For example, only changing the name:

```json
{
  "name": "New Laptop Name"
}
```

### How it works

1. Verify JWT.
2. Verify ADMIN role.
3. Convert URL ID to number.
4. Check whether product exists.
5. Update supplied fields.
6. Return updated product.

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "price": "75000",
    "stock": 10,
    "active": true,
    "createdAt": "2026-08-19T15:00:00.000Z"
  }
}
```

### Product Not Found

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

# 11. Change Product Stock

Only ADMIN can directly change stock.

### Endpoint

```http
PATCH http://localhost:5000/api/products/:id/stock
```

Example:

```http
PATCH http://localhost:5000/api/products/1/stock
```

### Headers

```text
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "stock": 50
}
```

### Validation

Stock must be:

- Integer
- Greater than or equal to 0

Invalid:

```json
{
  "stock": -5
}
```

Invalid:

```json
{
  "stock": 2.5
}
```

### Success Response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "price": "50000",
    "stock": 50,
    "active": true,
    "createdAt": "2026-08-19T15:00:00.000Z"
  }
}
```

---

# 12. Order APIs

An order contains:

```text
id
customer
order items
quantity
unit price
total price
status
idempotency key
created timestamp
```

Order statuses:

```text
PENDING
CANCELLED
```

---

# 13. Create Order

Only CUSTOMER can create an order.

### Endpoint

```http
POST http://localhost:5000/api/orders
```

### Headers

```text
Authorization: Bearer CUSTOMER_JWT_TOKEN
Content-Type: application/json
Idempotency-Key: order-1001
```

The `Idempotency-Key` is mandatory.

### Request Body

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

### How it works

The order creation is performed inside a PostgreSQL transaction.

The process is:

```text
Customer Request
       |
       v
Validate Idempotency Key
       |
       v
Check Existing Order
       |
       v
Validate Products
       |
       v
Lock Product Rows
       |
       v
Check Active Status
       |
       v
Check Stock
       |
       v
Calculate Total
       |
       v
Deduct Stock
       |
       v
Create Order
       |
       v
Create Order Items
       |
       v
COMMIT
```

If any operation fails:

```text
ROLLBACK
```

Therefore, we never create an order while only partially deducting inventory.

---

# 14. Order Transaction & Concurrency

The product rows are locked using PostgreSQL:

```sql
SELECT ...
FROM "Product"
WHERE id = ?
FOR UPDATE
```

This prevents overselling.

Example:

```text
Available stock = 1
```

Two customers simultaneously request:

```text
Customer A → quantity 1
Customer B → quantity 1
```

The database behaves approximately like:

```text
Customer A
    |
    | FOR UPDATE
    v
Product Row Locked
    |
    | stock = 1
    |
    | deduct 1
    v
stock = 0
    |
    | COMMIT
    v
Lock Released


Customer B
    |
    | FOR UPDATE
    v
Waits for Customer A
    |
    v
Gets Product Row
    |
    | stock = 0
    v
Insufficient Stock
```

Result:

```text
Customer A → Order Created
Customer B → 409 Insufficient Stock
```

This prevents inventory overselling.

---

# 15. Unit Price Snapshot

When the order is created, the current product price is copied into:

```text
OrderItem.unitPrice
```

Example:

```text
Product price today = ₹50,000
Customer orders product
OrderItem.unitPrice = ₹50,000
```

Later ADMIN changes product price:

```text
Product price = ₹55,000
```

The old order still contains:

```text
unitPrice = ₹50,000
```

This is important because historical orders should not change when product prices change.

---

# 16. Create Order Success

### Response

```http
201 Created
```

Example:

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "totalPrice": "102000",
    "status": "PENDING",
    "idempotencyKey": "order-1001",
    "requestHash": "HASH_VALUE",
    "createdAt": "2026-08-19T15:20:00.000Z",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 2,
        "unitPrice": "50000"
      }
    ]
  }
}
```

---

# 17. Invalid Quantity

Quantity must be a positive integer.

Valid:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

Invalid:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 0
    }
  ]
}
```

Invalid:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": -1
    }
  ]
}
```

Invalid:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 1.5
    }
  ]
}
```

Response:

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Quantity must be a positive integer"
}
```

---

# 18. Product Not Found During Order

Request:

```json
{
  "items": [
    {
      "productId": 99999,
      "quantity": 1
    }
  ]
}
```

Response:

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

# 19. Inactive Product

If:

```text
Product.active = false
```

the customer cannot order it.

Response:

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Product is inactive"
}
```

---

# 20. Insufficient Stock

Suppose:

```text
Available stock = 2
```

Customer requests:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 5
    }
  ]
}
```

Response:

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Insufficient stock"
}
```

No order is created and inventory is not changed.

---

# 21. Idempotency

The client must send:

```text
Idempotency-Key: order-1001
```

The key is unique per customer.

Database constraint:

```text
(userId, idempotencyKey)
```

---

## 21.1 Same Request Retried

First request:

```text
Idempotency-Key: order-1001
quantity: 2
```

Creates:

```text
Order #1
```

If the client retries:

```text
Idempotency-Key: order-1001
quantity: 2
```

the API returns the existing order instead of creating another order.

Response:

```http
200 OK
```

```json
{
  "success": true,
  "message": "Order already exists",
  "data": {}
}
```

Stock is not deducted again.

---

# 22. Idempotency Conflict

Suppose the first request was:

```text
Idempotency-Key: order-1001
quantity: 2
```

Then the customer sends:

```text
Idempotency-Key: order-1001
quantity: 5
```

The request payload hash is different.

Response:

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Idempotency key has already been used with a different request"
}
```

This prevents accidental reuse of an idempotency key for a different order.

---

# 23. Customer Order History

### Endpoint

```http
GET http://localhost:5000/api/orders/my
```

### Authentication

Required.

### Role

```text
CUSTOMER
```

### Header

```text
Authorization: Bearer CUSTOMER_JWT_TOKEN
```

### How it works

The API uses the `userId` from the JWT:

```text
JWT
 |
 v
userId
 |
 v
WHERE userId = currentUser
```

Therefore, a customer receives only their own orders.

### Response

```http
200 OK
```

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "totalPrice": "50000",
      "status": "PENDING",
      "idempotencyKey": "order-1001",
      "createdAt": "2026-08-19T15:20:00.000Z",
      "items": [
        {
          "id": 1,
          "productId": 1,
          "quantity": 1,
          "unitPrice": "50000",
          "product": {
            "id": 1,
            "name": "Laptop"
          }
        }
      ]
    }
  ]
}
```

---

# 24. Customer Get One Order

### Endpoint

```http
GET http://localhost:5000/api/orders/my/:id
```

Example:

```http
GET http://localhost:5000/api/orders/my/1
```

### Authentication

Required.

### Role

```text
CUSTOMER
```

### How authorization works

The database query checks both:

```text
orderId
AND
userId
```

Conceptually:

```sql
WHERE id = 1
AND userId = currentUserId
```

Therefore, a customer cannot access another customer's order.

If the order does not belong to the customer:

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Order not found"
}
```

---

# 25. ADMIN View All Orders

### Endpoint

```http
GET http://localhost:5000/api/orders
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Header

```text
Authorization: Bearer ADMIN_JWT_TOKEN
```

### How it works

The API returns orders from all customers.

It also includes:

- Customer information
- Order items
- Product information
- Quantity
- Unit price
- Total price
- Order status

### Response

```http
200 OK
```

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "totalPrice": "50000",
      "status": "PENDING",
      "createdAt": "2026-08-19T15:20:00.000Z",
      "user": {
        "id": 2,
        "name": "Prakash",
        "email": "prakash@test.com"
      },
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "unitPrice": "50000",
          "product": {
            "id": 1,
            "name": "Laptop"
          }
        }
      ]
    }
  ]
}
```

---

# 26. Authentication Errors

## Missing Token

Request:

```http
GET /api/orders/my
```

without:

```text
Authorization: Bearer TOKEN
```

Response:

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

---

## Invalid Token

```text
Authorization: Bearer invalid-token
```

Response:

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

# 27. Role Authorization

Authentication and authorization are separate.

### Authentication

Answers:

```text
"Who are you?"
```

JWT verifies the user.

### Authorization

Answers:

```text
"Are you allowed to do this?"
```

For example:

```ts
(authenticate, authorize("ADMIN"));
```

means:

```text
1. Verify JWT
2. Check user's role
3. Allow only ADMIN
```

A CUSTOMER trying to access an ADMIN endpoint receives:

```http
403 Forbidden
```

---

# 28. Current API Summary

| Method | Endpoint                  | Role             | Purpose              |
| ------ | ------------------------- | ---------------- | -------------------- |
| POST   | `/api/auth/register`      | Public           | Register customer    |
| POST   | `/api/auth/login`         | Public           | Login                |
| POST   | `/api/products`           | ADMIN            | Create product       |
| GET    | `/api/products`           | CUSTOMER / ADMIN | View active products |
| PATCH  | `/api/products/:id`       | ADMIN            | Update product       |
| PATCH  | `/api/products/:id/stock` | ADMIN            | Change stock         |
| POST   | `/api/orders`             | CUSTOMER         | Create order         |
| GET    | `/api/orders/my`          | CUSTOMER         | View own orders      |
| GET    | `/api/orders/my/:id`      | CUSTOMER         | View one own order   |
| GET    | `/api/orders`             | ADMIN            | View all orders      |

---

# 29. API Flow

Typical customer flow:

```text
Register
   |
   v
Login
   |
   v
Receive JWT
   |
   v
GET Active Products
   |
   v
Select Products
   |
   v
POST /api/orders
   |
   v
Validate Products
   |
   v
Lock Inventory
   |
   v
Check Stock
   |
   v
Deduct Stock
   |
   v
Create Order
   |
   v
Receive Order
   |
   v
GET /api/orders/my
```

ADMIN flow:

```text
Login
   |
   v
Receive ADMIN JWT
   |
   +----> Create Product
   |
   +----> Update Product
   |
   +----> Change Stock
   |
   +----> View All Orders
```

---

# 30. Database Relationships

```text
User
 |
 | 1
 |
 | many
 v
Order
 |
 | 1
 |
 | many
 v
OrderItem
 |
 | many
 |
 | 1
 v
Product
```

### User → Order

One customer can have many orders.

### Order → OrderItem

One order can contain multiple products.

### Product → OrderItem

A product can appear in many order items.

---

# 31. Important Database Constraints

### User

```text
email UNIQUE
```

Prevents duplicate accounts.

### Order

```text
(userId, idempotencyKey) UNIQUE
```

Prevents duplicate orders for the same customer and idempotency key.

### Foreign Keys

Orders reference users:

```text
Order.userId → User.id
```

Order items reference orders:

```text
OrderItem.orderId → Order.id
```

Order items reference products:

```text
OrderItem.productId → Product.id
```

---

# 32. Database Migration Commands

Create migration:

```bash
npx prisma migrate dev --name init
```

After schema changes:

```bash
npx prisma migrate dev --name migration_name
```

Generate Prisma Client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 33. Run Commands

Install dependencies:

```bash
npm install
```

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Seed ADMIN:

```bash
npx tsx prisma/seed.ts
```

---

# 34. Pending Features

The following assessment requirements are still to be implemented:

- Customer order cancellation
- Restore inventory during cancellation
- Prevent inventory restoration twice
- Concurrent cancellation protection
- Global error-handling middleware
- Additional validation improvements
- Automated tests
- Optional Docker Compose
- Optional Swagger/OpenAPI
- Optional pagination

These should be implemented before final submission if time permits.

---

# 35. HTTP Status Codes

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 200    | Successful request                                       |
| 201    | Resource successfully created                            |
| 400    | Invalid request/validation error                         |
| 401    | Authentication required/invalid token                    |
| 403    | Authenticated but not authorized                         |
| 404    | Resource not found                                       |
| 409    | Conflict such as insufficient stock/idempotency conflict |
| 500    | Internal server error                                    |

---

# 36. Security

The application implements:

- bcrypt password hashing
- JWT authentication
- Role-based authorization
- Customer-specific order access
- PostgreSQL transactions
- Row-level locking for inventory
- Idempotency keys
- Request payload hashing
- Database unique constraints
- Foreign key constraints

Passwords are never returned in API responses.

JWT tokens are required for protected APIs.

Customer order queries are always scoped using the authenticated user's ID.

---

# 37. Example Complete Order Request

```http
POST http://localhost:5000/api/orders
Authorization: Bearer CUSTOMER_JWT_TOKEN
Content-Type: application/json
Idempotency-Key: order-1001
```

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

The backend:

```text
1. Authenticate customer
2. Validate idempotency key
3. Calculate request hash
4. Check duplicate request
5. Start PostgreSQL transaction
6. Lock product rows
7. Validate product existence
8. Validate active status
9. Validate quantity
10. Validate stock
11. Calculate total price
12. Deduct inventory
13. Create order
14. Create order items
15. Commit transaction
16. Return order
```

If any step fails:

```text
ROLLBACK
```

No partial database changes remain.
