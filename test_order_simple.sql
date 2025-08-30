-- Quick test for order creation with proper UUID
-- Run this step by step in Supabase SQL Editor

-- Step 1: Get a real product ID
SELECT id, name FROM products LIMIT 3;

-- Step 2: Use one of the UUIDs from step 1 and replace 'YOUR_PRODUCT_UUID_HERE'
INSERT INTO orders (
    product_id, customer_name, customer_email, customer_phone,
    order_type, amount, status, payment_method, client_external_id
) VALUES (
    'YOUR_PRODUCT_UUID_HERE', -- Replace with actual UUID from step 1
    'Test Customer Debug', 
    'debug@test.com', 
    '081234567890',
    'purchase', 
    150000, 
    'pending', 
    'xendit', 
    'debug-test-' || extract(epoch from now())::text
);

-- Step 3: Verify the order was created
SELECT * FROM orders WHERE customer_name = 'Test Customer Debug';

-- Step 4: Clean up
-- DELETE FROM orders WHERE customer_name = 'Test Customer Debug';
