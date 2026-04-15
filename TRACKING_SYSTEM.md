# Live Order Tracking System

## Overview

The tracking system allows users to track their orders in real-time using a visual map interface. It integrates **Leaflet** for maps, **17TRACK** for tracking data, and supports **TomTom** for routing.

## Features

- **Visual Map**: Interactive map showing origin, current location, and destination.
- **Real-time Status**: Timeline of tracking events (Confirmed, Shipped, Out for Delivery, etc.).
- **Smart Routing**: Visualizes the path taken by the package.
- **Responsive Design**: Works on mobile and desktop.

## Components

### Backend

- **`server/services/trackingService.js`**: Handles interactions with 17TRACK API. Includes mock data generation for development.
- **`server/controllers/trackingController.js`**: API endpoints for frontend consumption.
- **`server/routes/trackingRoutes.js`**: Defines `/api/tracking/:number` route.
- **`server/services/emailService.js`**: Enhanced to send transactional emails for order status updates.

### Frontend

- **`frontend/tracking.js`**: Manages map initialization (Leaflet), data fetching, and UI rendering.
- **`frontend/pages.js`**: Contains the `tracking` page template.
- **`frontend/script.js`**: Routing logic for `/track` and `/track/:id`.

## Configuration

Ensure these keys are in your `.env` file:

```env
TRACK17_API_KEY=your_key_here  # Optional: uses mock data if missing
TOMTOM_API_KEY=your_key_here   # Optional: for advanced routing
```

## Usage

### 1. Track an Order

Navigate to `#/track` and enter a tracking number.
Or use a direct link: `#/track/XP-123456789`

### 2. Warehouse Update

When warehouse staff updates an order to "Shipped", they should:

1. Generate/Enter a tracking number.
2. The system registers it with 17TRACK (via backend).
3. The user receives an email with the tracking link.

## Implementation Details

- **Map Library**: Leaflet.js (v1.9.4)
- **Icons**: Lucide Icons
- **Data Source**: 17TRACK (or Mock)

### Mock Data

If no API key is provided, the system returns simulation data for testing:

- Valid Tracking Number: Any string
- Route: Los Angeles -> Newark -> New York
- Status: In Transit/Delivered based on simulation logic
