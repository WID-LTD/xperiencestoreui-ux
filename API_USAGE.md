# Xperiencestore REST API Documentation

Welcome to the Xperiencestore API documentation. Use our API to integrate your external store, automate order fulfillment, and sync inventory in real-time.

## Authentication

All API requests require an API key to be sent in the headers:

```http
x-api-key: your_api_key_here
```

You can generate your API key from the [API Management Management](#/api-management) page.

---

## Base URL

```
https://api.xperiencestore.com/v1
```

---

## Endpoints

### 1. Products

#### List Products
Retrieve a list of available products for dropshipping.

**URL:** `/products`  
**Method:** `GET`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Luxury Smart Watch",
    "description": "Premium fitness tracking...",
    "price": 45000.00,
    "category": "Electronics",
    "stock": 142
  }
]
```

---

### 2. Orders

#### Create Order
Submit a new order for fulfillment.

**URL:** `/orders`  
**Method:** `POST`

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2,
  "customer_name": "John Doe",
  "shipping_address": "123 Lagos Way, Ikeja, Lagos",
  "phone": "08012345678"
}
```

#### Track Order
Get real-time tracking status for an order.

**URL:** `/orders/:orderId/track`  
**Method:** `GET`

---

### 3. Inventory

#### Check Stock
Verify real-time stock levels for a product.

**URL:** `/inventory/:productId`  
**Method:** `GET`

---

## Webhooks

We support webhooks to notify your system about order status changes. You can configure your endpoint in the dashboard.

**Supported Events:**
- `order.shipped`
- `order.delivered`
- `inventory.low`

---

## Errors

The API uses standard HTTP response codes:
- `200` - Success
- `401` - Unauthorized (Missing or invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

---

© 2026 Xperiencestore. All rights reserved.
