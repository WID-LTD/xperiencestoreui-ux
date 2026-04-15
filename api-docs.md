# Xperiencestore RESTful API Documentation

Welcome to the Xperiencestore API! This document provides a guide for dropshippers to connect their external stores and automate order/inventory management.

## Authentication

All API requests require a Bearer token in the `Authorization` header. You can find your API key in the [API Management Dashboard](/dropshipper/api-management).

```http
Authorization: Bearer YOUR_API_KEY
```

## Base URL
`https://api.xperiencestore.com/v1`

---

## 1. Products API

### List Products
`GET /products`
Retrieve a list of available products in the catalog.

### Get Product Details
`GET /products/:id`

---

## 2. Order Management

### Create Order
`POST /orders`
Place an order on behalf of your customer.

### Track Order
`GET /orders/:id/track`

---

## 3. Inventory Sync

### Get Stock Levels
`GET /inventory`

---

## Webhooks

We support real-time notifications for the following events:
- `order.shipped`: Triggered when an order is out for delivery.
- `inventory.low`: Triggered when stock falls below 5 units.

To set up a webhook, navigate to the [API Management Dashboard](/dropshipper/api-management) and add your endpoint URL.

---

## Rate Limiting

The API is limited to **60 requests per minute** per API key. Exceeding this limit will return a `429 Too Many Requests` response.

---

## Support

For technical assistance, contact `api-support@xperiencestore.com`.
