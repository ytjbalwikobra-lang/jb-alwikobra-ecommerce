-- Test Manual Order Creation dengan UUID validation
-- Test 1: Valid UUID
INSERT INTO orders (
    id,
    product_id,
    customer_name,
    customer_email,
    customer_phone,
    amount,
    status,
    client_external_id,
    created_at
) VALUES (
    gen_random_uuid(),
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'Test User Valid UUID',
    'test1@example.com',
    '081234567890',
    100000,
    'pending',
    'test-' || extract(epoch from now()),
    now()
);

-- Test 2: No product_id (should work - nullable field)
INSERT INTO orders (
    id,
    customer_name,
    customer_email,
    customer_phone,
    amount,
    status,
    client_external_id,
    created_at
) VALUES (
    gen_random_uuid(),
    'Test User No Product ID',
    'test2@example.com',
    '081234567891',
    150000,
    'pending',
    'test-no-product-' || extract(epoch from now()),
    now()
);

-- Test 3: NULL product_id (should work)
INSERT INTO orders (
    id,
    product_id,
    customer_name,
    customer_email,
    customer_phone,
    amount,
    status,
    client_external_id,
    created_at
) VALUES (
    gen_random_uuid(),
    NULL,
    'Test User NULL Product ID',
    'test3@example.com',
    '081234567892',
    200000,
    'pending',
    'test-null-product-' || extract(epoch from now()),
    now()
);

-- Check hasil
SELECT 
    id,
    product_id,
    customer_name,
    customer_email,
    amount,
    client_external_id,
    created_at
FROM orders 
WHERE customer_email LIKE 'test%@example.com'
ORDER BY created_at DESC
LIMIT 10;
