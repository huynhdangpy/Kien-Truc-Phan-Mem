# Online Food Delivery - 3 Architectures

This project contains three implementations of the same domain:

- monolithic
- service-based
- microservices

## Folder structure

- monolithic/
  - client/: React (Vite + Tailwind)
  - server/: Express MVC + JWT + MongoDB
- service-based/
  - gateway/: API gateway
  - user-service/
  - product-service/
  - order-service/
- microservices/
  - api-gateway/
  - auth-service/
  - product-service/
  - order-service/
  - cart-service/
  - client/: React frontend for microservices

## Quick start

### Monolithic

- cd monolithic
- docker compose up --build

### Service-based

- cd service-based
- docker compose up --build

### Microservices

- cd microservices
- docker compose up --build

## MongoDB support

All architectures support local MongoDB by default and MongoDB Atlas via environment variables:

- monolithic: MONGO_URI
- service-based: MONGO_URI
- microservices: AUTH_MONGO_URI, PRODUCT_MONGO_URI, ORDER_MONGO_URI, CART_MONGO_URI

## Security

- JWT-based authentication in monolithic and auth-service.
- Protected routes are implemented in monolithic frontend and backend.

## Notes

- Product CRUD admin control is enforced in monolithic backend (role=admin).
- For quick testing, update user role in database manually.
