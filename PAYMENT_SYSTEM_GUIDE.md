# Xperiencestore Payment System Implementation

## Overview

A comprehensive multi-gateway payment system with real-time currency conversion and custom gift card support.

## Features Implemented

### 1. **Multiple Payment Gateways**

- ✅ **Stripe** - Global card payments
- ✅ **Paystack** - Nigerian payments (Cards, Bank, USSD)
- ✅ **Flutterwave** -African payments
- ✅ **PayPal** - PayPal wallet
- ✅ **Gift Card** - Xperiencestore custom gift cards

### 2. **Multi-Currency Support**

Supported Currencies:

- USD (US Dollar) 🇺🇸
- EUR (Euro) 🇪🇺
- GBP (British Pound) 🇬🇧
- NGN (Nigerian Naira) 🇳🇬
- GHS (Ghanaian Cedi) 🇬🇭
- KES (Kenyan Shilling) 🇰🇪
- ZAR (South African Rand) 🇿🇦
- CAD, AUD, JPY, CNY, INR (also supported)

**Features:**

- Real-time exchange rate fetching
- Exchange rate caching (1-hour cache)
- Automatic currency conversion during checkout
- User-selectable preferred currency
- Currency selector in navigation bar

### 3. **Gift Card System**

**Features:**

- Purchase gift cards with real money
- Unique gift card codes (XP-XXXX-XXXX-XXXX format)
- Redeem gift cards to wallet balance
- Use gift card balance for purchases
- Multi-currency gift cards
- Gift card expiry dates
- Transaction history

### 4. **User Wallets**

- Multi-currency wallet support
- Separate balances for each currency
- Gift card balance tracking
- Transaction history

## Database Schema

### New Tables Created:

1. **gift_card_transactions** - Tracks all gift card activities
2. **payment_transactions** - Records all payment attempts and completions
3. **user_wallets** - Multi-currency wallet balances
4. **wallet_transactions** - Wallet transaction history
5. **currency_rates** - Exchange rate caching

### Extended Tables:

- **users**: Added `preferred_currency` column
- **orders**: Added `currency`, `payment_method`, `payment_gateway`, `gift_card_applied` columns
- **gift_cards**: Added `purchaser_id`, `recipient_email`, `original_amount` columns

## Backend API Endpoints

### Payment Endpoints:

```
POST   /api/payment/initialize          - Initialize payment with gateway
POST   /api/payment/confirm             - Confirm payment completion
GET    /api/payment/gateways            - Get available payment gateways
POST   /api/payment/gift-card/purchase  - Purchase a gift card
POST   /api/payment/gift-card/redeem    - Redeem gift card code
GET    /api/payment/gift-card/balance/:userId/:currency - Get gift card balance
```

### Currency Endpoints:

```
GET    /api/currency/supported          - Get all supported currencies
GET    /api/currency/rate/:from/:to     - Get exchange rate
POST   /api/currency/convert            - Convert amount between currencies
```

## Frontend Components

### 1. **Payment Module** (`payment.js`)

- Currency conversion
- Payment gateway initialization
- Gift card operations
- Currency selection management

### 2. **Payment Checkout Modal** (`paymentModal.js`)

- Beautiful payment gateway selection UI
- Real-time currency conversion display
- Gift card balance application
- Gift card redemption
- Gateway-specific payment flows

### 3. **Currency Selector**

- Global currency selector in navigation
- Persists user preference in localStorage
- Auto-reload on currency change

## Usage Examples

### Checkout Flow:

```javascript
// Open payment modal during checkout
PaymentCheckoutModal.open(orderId, totalAmount, userId);
```

### Purchase Gift Card:

```javascript
await Payment.purchaseGiftCard(
  userId,
  amount,
  currency,
  recipientEmail,
  paymentGateway,
);
```

### Redeem Gift Card:

```javascript
await Payment.redeemGiftCard(userId, giftCardCode);
```

### Convert Currency:

```javascript
const converted = await Payment.convertCurrency(100, "USD", "NGN");
// Returns: { originalAmount: 100, convertedAmount: 45000, rate: 450 }
```

## Environment Variables Required

Add to `.env` file:

```env
# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Currency API (Optional - uses free API by default)
EXCHANGE_RATE_API_KEY=your_key_here
```

## Database Setup

Run the updated schema:

```bash
psql -U your_user -d xperiencestore -f server/schema.sql
```

Or apply just the new additions:

```sql
-- Run the ALTER TABLE and CREATE TABLE statements from schema.sql
```

## Payment Flow

### Standard Purchase:

1. User selects products and proceeds to checkout
2. User selects preferred currency (if different from USD)
3. System converts total to user's currency
4. User can apply gift card balance (partial or full)
5. User selects payment gateway
6. Payment is processed through selected gateway
7. Transaction is recorded with all details
8. Order status is updated to "paid"

### Gift Card Purchase:

1. User navigates to gift card purchase page
2. Selects amount and currency
3. Enters recipient email (optional)
4. Selects payment gateway
5. Completes payment
6. Unique gift card code is generated
7. Gift card is emailed to recipient

### Gift Card Redemption:

1. User enters gift card code
2. System validates code and expiry
3. Balance is added to user's wallet (by currency)
4. Gift card is marked as redeemed
5. User can use balance for future purchases

## Security Features

- Transaction reference uniqueness
- Payment status validation
- Gateway response verification
- Gift card code uniqueness
- Expiry date validation
- Balance verification before deduction
- Database transactions for atomic operations

## Testing

1. **Test Payment Gateway**:
   - Use test API keys in development
   - Test each gateway separately
   - Verify callback handling

2. **Test Currency Conversion**:
   - Convert between different currencies
   - Verify exchange rates are current
   - Test caching mechanism

3. **Test Gift Cards**:
   - Purchase gift card
   - Redeem gift card
   - Use gift card balance
   - Test expiry validation

## Future Enhancements

- [ ] Recurring payments/subscriptions
- [ ] Split payments (multiple gateways)
- [ ] Cryptocurrency support
- [ ] Mobile money integration
- [ ] Payment analytics dashboard
- [ ] Refund management UI
- [ ] Invoice generation
- [ ] Payment reminders

## Support

For issues or questions:

- Backend: Check `server/controllers/paymentController.js`
- Frontend: Check `frontend/payment.js` and `frontend/paymentModal.js`
- Database: Check `server/schema.sql`
