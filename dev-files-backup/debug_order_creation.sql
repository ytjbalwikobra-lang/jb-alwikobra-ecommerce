-- Debug script for order creation testing
-- Run this in Supabase SQL Editor

-- 1. Check existing products to get real UUIDs
SELECT id, name FROM products LIMIT 5;

-- 2. Check orders table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
ORDER BY ordinal_position;

-- 3. Check if client_external_id column exists
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='orders' AND column_name='client_external_id';

-- 4. Test insert with actual product UUID (replace with real UUID from step 1)
-- First get a real product ID:
DO $$
DECLARE
    real_product_id UUID;
BEGIN
    SELECT id INTO real_product_id FROM products LIMIT 1;
    
    IF real_product_id IS NOT NULL THEN
        INSERT INTO orders (
            product_id, customer_name, customer_email, customer_phone,
            order_type, amount, status, payment_method, client_external_id
        ) VALUES (
            real_product_id, 'Test Customer', 'test@email.com', '081234567890',
            'purchase', 100000, 'pending', 'xendit', 'test-external-id-' || extract(epoch from now())
        );
        
        RAISE NOTICE 'Test order created successfully with product_id: %', real_product_id;
    ELSE
        RAISE NOTICE 'No products found in database';
    END IF;
END $$;

-- 5. Check if test order was created
SELECT id, product_id, customer_name, amount, status, client_external_id, created_at 
FROM orders 
WHERE customer_name = 'Test Customer' 
ORDER BY created_at DESC 
LIMIT 1;

-- 6. Clean up test data
DELETE FROM orders WHERE customer_name = 'Test Customer';
