-- Cek produk yang sebenarnya ada di database
SELECT id, name, created_at FROM products ORDER BY created_at DESC LIMIT 10;

-- Cek apakah ada produk dengan id yang null atau format aneh
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as products_with_valid_id FROM products WHERE id IS NOT NULL;

-- Test dengan produk ID asli (ganti dengan UUID yang benar dari query pertama)
-- Contoh jika UUID asli adalah: a1b2c3d4-e5f6-7890-abcd-ef1234567890
/*
INSERT INTO orders (
    product_id, customer_name, customer_email, customer_phone,
    order_type, amount, status, payment_method, client_external_id
) VALUES (
    (SELECT id FROM products LIMIT 1), -- Ambil produk pertama otomatis
    'Test Real Product ID', 
    'real-test@test.com', 
    '081234567890',
    'purchase', 
    200000, 
    'pending', 
    'xendit', 
    'real-product-test-' || extract(epoch from now())::text
);
*/

-- Verifikasi insert berhasil
-- SELECT * FROM orders WHERE customer_name = 'Test Real Product ID';
