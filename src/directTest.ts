import { supabase } from './services/supabase';

const runDirectTest = async () => {
  console.log('🧪 Running direct database test...');
  
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return;
  }

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣ Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }
    console.log('✅ Connection successful');

    // Test 2: Check schema structure
    console.log('2️⃣ Testing schema structure...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('products')
      .select('id, name, price, game_title_id, tier_id')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema test failed:', schemaError);
      
      // Try legacy schema
      const { data: legacyTest, error: legacyError } = await supabase
        .from('products')
        .select('id, name, price, game_title')
        .limit(1);
        
      if (legacyError) {
        console.error('❌ Legacy schema also failed:', legacyError);
      } else {
        console.log('⚠️ Using legacy schema');
      }
    } else {
      console.log('✅ Modern schema working');
    }

    // Test 3: Check reference tables
    console.log('3️⃣ Testing reference tables...');
    
    const { data: tiers, error: tiersError } = await supabase
      .from('tiers')
      .select('*')
      .limit(5);
    
    if (tiersError) {
      console.error('❌ Tiers table error:', tiersError);
    } else {
      console.log(`✅ Tiers table: ${tiers?.length || 0} records`);
    }

    const { data: games, error: gamesError } = await supabase
      .from('game_titles')
      .select('*')
      .limit(5);
    
    if (gamesError) {
      console.error('❌ Game titles table error:', gamesError);
    } else {
      console.log(`✅ Game titles table: ${games?.length || 0} records`);
    }

    // Test 4: Test product creation
    console.log('4️⃣ Testing product creation...');
    const testProduct = {
      name: `Direct Test Product ${Date.now()}`,
      description: 'This is a direct test product',
      price: 25000,
      original_price: null,
      image: '',
      images: [],
      account_level: 'Level 30',
      account_details: 'Test account details',
      is_flash_sale: false,
      has_rental: false,
      stock: 1,
      game_title_id: games && games.length > 0 ? games[0].id : null,
      tier_id: tiers && tiers.length > 0 ? tiers[0].id : null
    };

    console.log('📝 Creating test product with data:', testProduct);
    
    const { data: created, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (createError) {
      console.error('❌ Product creation failed:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      });
    } else {
      console.log('✅ Product created successfully:', created.id);
      
      // Test 5: Test product update
      console.log('5️⃣ Testing product update...');
      const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({ name: `Updated ${testProduct.name}` })
        .eq('id', created.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Product update failed:', updateError);
      } else {
        console.log('✅ Product updated successfully');
      }

      // Cleanup
      console.log('🗑️ Cleaning up test product...');
      await supabase.from('products').delete().eq('id', created.id);
    }

    console.log('🎉 Direct test completed successfully!');

  } catch (error) {
    console.error('💥 Direct test failed:', error);
  }
};

// Run the test
runDirectTest();
