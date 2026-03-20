# Service-based Architecture

## Services

- gateway: 7000
- user-service: 5001
- product-service: 5002
- order-service: 5003

## Run

- docker compose up --build

## Endpoints via gateway

- /api/users/auth/register
- /api/users/auth/login
- /api/users/profile
- /api/products
- /api/orders
- /api/orders/history/:userId

## Notes

- Services communicate via REST.
- Gateway proxies requests to each backend service.
- MONGO_URI can be overridden to use MongoDB Atlas.
