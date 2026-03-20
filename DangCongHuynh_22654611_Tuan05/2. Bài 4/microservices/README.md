# Microservices Architecture

## Services

- api-gateway: 8000
- auth-service: 5001
- product-service: 5002
- order-service: 5003
- cart-service: 5004

## Databases

Each service owns its own MongoDB container:

- auth: mongo-auth
- product: mongo-product
- order: mongo-order
- cart: mongo-cart

## Run

- docker compose up --build

## Client

- http://localhost:5174

## API via gateway

- /api/auth/register
- /api/auth/login
- /api/auth/profile
- /api/products
- /api/cart/:userId
- /api/orders
- /api/orders/history/:userId

## Atlas support

Set these environment variables before compose run:

- AUTH_MONGO_URI
- PRODUCT_MONGO_URI
- ORDER_MONGO_URI
- CART_MONGO_URI
