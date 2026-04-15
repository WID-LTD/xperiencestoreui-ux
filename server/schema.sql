-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'consumer',
    company_name VARCHAR(255),
    profile_image VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    code_expires_at TIMESTAMP,
    reset_token VARCHAR(100),
    reset_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    supplier_id INTEGER REFERENCES users (id),
    bulk_price DECIMAL(10, 2),
    moq INTEGER DEFAULT 1,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_sponsored BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    shipping_address TEXT,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders (id),
    product_id INTEGER REFERENCES products (id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    purchaser_id INTEGER REFERENCES users (id),
    recipient_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gift Card Transactions Table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id SERIAL PRIMARY KEY,
    gift_card_id INTEGER REFERENCES gift_cards (id),
    user_id INTEGER REFERENCES users (id),
    transaction_type VARCHAR(20) NOT NULL, -- 'purchase', 'redeem', 'refund'
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    order_id INTEGER REFERENCES orders (id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    original_amount DECIMAL(10, 2), -- amount in user's currency before conversion
    original_currency VARCHAR(10),
    exchange_rate DECIMAL(10, 4),
    payment_gateway VARCHAR(50) NOT NULL, -- 'paystack', 'flutterwave', 'paypal', 'stripe', 'gift_card'
    payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'wallet', 'gift_card'
    transaction_reference VARCHAR(255) UNIQUE,
    gateway_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Wallets Table (Multi-Currency Support)
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    gift_card_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, currency)
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES user_wallets (id),
    transaction_type VARCHAR(50) NOT NULL, -- 'credit', 'debit', 'gift_card_credit', 'gift_card_debit'
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency Exchange Rates Cache Table
CREATE TABLE IF NOT EXISTS currency_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (
        base_currency,
        target_currency
    )
);

-- Add currency and preferred_currency to users table (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD';

-- Add payment details to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS gift_card_applied DECIMAL(10, 2) DEFAULT 0.00;

-- Add tracking details to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS carrier_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- RFQ Table
CREATE TABLE IF NOT EXISTS rfqs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'open', -- open, quoted, closed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dropshipper Stores Table
CREATE TABLE IF NOT EXISTS user_stores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    store_name VARCHAR(255) UNIQUE,
    store_slug VARCHAR(255) UNIQUE,
    description TEXT,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255),
    theme_color VARCHAR(50) DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Products (Dropshipper's selection)
CREATE TABLE IF NOT EXISTS store_products (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES user_stores(id),
    product_id INTEGER REFERENCES products(id),
    custom_price DECIMAL(10, 2), -- Optional markup
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, product_id)
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    key_name VARCHAR(255),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    type VARCHAR(50), -- 'shipping', 'billing'
    name VARCHAR(255),
    phone VARCHAR(20),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS user_bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_number VARCHAR(50) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(255),
    recipient_code VARCHAR(100), -- Paystack/Klasha Transfer Recipient ID
    currency VARCHAR(10) DEFAULT 'NGN',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payout Requests Table
CREATE TABLE IF NOT EXISTS payout_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    wallet_id INTEGER REFERENCES user_wallets(id),
    bank_account_id INTEGER REFERENCES user_bank_accounts(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    reference VARCHAR(255) UNIQUE,
    error_message TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);