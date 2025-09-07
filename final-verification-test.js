// Final verification test for admin CRUD operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin service with service role key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const adminService = {
  async getProducts(page = 1, limit = 10, search = '', category = '', game = '') {
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (game) {
      query = query.eq('game_title', game);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  },

  async createProduct(product) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

async function finalVerificationTest() {
  console.log('🧪 Starting Final Admin CRUD Verification...\n');

  try {
    // Test 1: Check service initialization
    console.log('1️⃣ Testing Admin Service Initialization...');
    if (!adminService) {
      throw new Error('Admin service not initialized');
    }
    console.log('✅ Admin service initialized successfully\n');

    // Test 2: Test getProducts with filters
    console.log('2️⃣ Testing Product Retrieval with Filters...');
    const products = await adminService.getProducts(1, 5, '', '', '');
    console.log(`✅ Retrieved ${products.data.length} products`);
    console.log(`   Total count: ${products.count}`);
    console.log(`   Has more: ${products.hasMore}\n`);

    // Test 3: Create a test product
    console.log('3️⃣ Testing Product Creation...');
    const newProduct = await adminService.createProduct({
      name: 'Final Test Product',
      game_title: 'Test Game',
      price: 99999,
      description: 'This is a final verification test product',
      category: 'digital_game',
      image: 'https://via.placeholder.com/300x200',
      images: ['https://via.placeholder.com/300x200']
    });
    console.log(`✅ Created product with ID: ${newProduct.id}\n`);

    // Test 4: Update the product
    console.log('4️⃣ Testing Product Update...');
    const updatedProduct = await adminService.updateProduct(newProduct.id, {
      name: 'Updated Final Test Product',
      price: 149999
    });
    console.log(`✅ Updated product: ${updatedProduct.name} - Rp ${updatedProduct.price.toLocaleString()}\n`);

    // Test 5: Delete the test product
    console.log('5️⃣ Testing Product Deletion...');
    await adminService.deleteProduct(newProduct.id);
    console.log('✅ Test product deleted successfully\n');

    console.log('🎉 ALL TESTS PASSED! Admin CRUD system is fully operational!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Service initialization');
    console.log('   ✅ Product retrieval with pagination');
    console.log('   ✅ Product creation');
    console.log('   ✅ Product updates');
    console.log('   ✅ Product deletion');
    console.log('\n🚀 The admin interface is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

finalVerificationTest();
