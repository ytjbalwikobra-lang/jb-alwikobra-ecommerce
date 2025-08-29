import { supabase } from '../services/supabase.ts';

interface SchemaInfo {
  hasRelationalSchema: boolean;
  tiersCount: number;
  gameTitlesCount: number;
  productsCount: number;
  issues: string[];
  recommendations: string[];
}

export const comprehensiveSchemaCheck = async (): Promise<SchemaInfo> => {
  const result: SchemaInfo = {
    hasRelationalSchema: false,
    tiersCount: 0,
    gameTitlesCount: 0,
    productsCount: 0,
    issues: [],
    recommendations: []
  };

  if (!supabase) {
    result.issues.push('Supabase client not initialized');
    return result;
  }

  console.log('🔍 Starting comprehensive schema check...');

  try {
    // Check if relational tables exist and have data
    console.log('📊 Checking tiers table...');
    const { data: tiers, error: tiersError } = await supabase
      .from('tiers')
      .select('id, name, is_active')
      .eq('is_active', true);

    if (tiersError) {
      result.issues.push(`Tiers table error: ${tiersError.message}`);
    } else {
      result.tiersCount = tiers?.length || 0;
      console.log(`✅ Found ${result.tiersCount} active tiers`);
    }

    console.log('🎮 Checking game_titles table...');
    const { data: games, error: gamesError } = await supabase
      .from('game_titles')
      .select('id, name, is_active')
      .eq('is_active', true);

    if (gamesError) {
      result.issues.push(`Game titles table error: ${gamesError.message}`);
    } else {
      result.gameTitlesCount = games?.length || 0;
      console.log(`✅ Found ${result.gameTitlesCount} active game titles`);
    }

    // Check products table with relational fields
    console.log('📦 Checking products table with relational fields...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, game_title_id, tier_id, game_title')
      .limit(5);

    if (productsError) {
      result.issues.push(`Products relational query error: ${productsError.message}`);
      
      // Try basic products query
      console.log('📦 Trying basic products query...');
      const { data: basicProducts, error: basicError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5);

      if (basicError) {
        result.issues.push(`Products basic query error: ${basicError.message}`);
      } else {
        result.productsCount = basicProducts?.length || 0;
        console.log(`⚠️ Products table accessible but missing relational fields`);
      }
    } else {
      result.productsCount = products?.length || 0;
      result.hasRelationalSchema = true;
      console.log(`✅ Products table supports relational queries`);

      // Analyze data consistency
      const withRelations = products?.filter(p => p.game_title_id || p.tier_id).length || 0;
      const withLegacyFields = products?.filter(p => p.game_title && !p.game_title_id).length || 0;

      if (withLegacyFields > 0) {
        result.issues.push(`${withLegacyFields} products using legacy game_title field`);
        result.recommendations.push('Migrate legacy game_title fields to game_title_id references');
      }

      console.log(`📊 Products analysis: ${withRelations} with relations, ${withLegacyFields} with legacy fields`);
    }

    // Test product creation
    console.log('🧪 Testing product creation...');
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'Test description',
      price: 10000,
      original_price: null,
      image: '',
      images: [],
      category: 'test', // Add category field to satisfy NOT NULL constraint
  // Fallback for environments with NOT NULL game_title text column
  game_title: 'Test Game',
      account_level: null,
      account_details: null,
      is_flash_sale: false,
      has_rental: false,
      stock: 1,
      game_title_id: null,
      tier_id: null
    };

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (createError) {
      result.issues.push(`Product creation test failed: ${createError.message}`);
      console.error('❌ Product creation test failed:', createError);
    } else {
      console.log('✅ Product creation test successful');
      
      // Clean up test product
      await supabase.from('products').delete().eq('id', createdProduct.id);
      console.log('🗑️ Test product cleaned up');
    }

    // Check rental_options table
    console.log('🏠 Checking rental_options table...');
    const { data: rentals, error: rentalsError } = await supabase
      .from('rental_options')
      .select('id, product_id, duration, price')
      .limit(1);

    if (rentalsError) {
      result.issues.push(`Rental options table error: ${rentalsError.message}`);
    } else {
      console.log('✅ Rental options table accessible');
    }

    // Provide recommendations
    if (result.tiersCount === 0) {
      result.recommendations.push('No active tiers found - admin should populate tiers table');
    }
    if (result.gameTitlesCount === 0) {
      result.recommendations.push('No active game titles found - admin should populate game_titles table');
    }
    if (result.productsCount === 0) {
      result.recommendations.push('No products found - consider creating sample products');
    }

    console.log('✅ Schema check completed');
    return result;

  } catch (error) {
    console.error('💥 Schema check failed:', error);
    result.issues.push(`Unexpected error: ${error}`);
    return result;
  }
};

export const fixCommonSchemaIssues = async (): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase client not initialized' };
  }

  console.log('🔧 Attempting to fix common schema issues...');

  try {
    // Check if we need to populate reference data
    const { data: tiers } = await supabase.from('tiers').select('id').limit(1);
    const { data: games } = await supabase.from('game_titles').select('id').limit(1);

    if (!tiers || tiers.length === 0) {
      console.log('📊 Populating missing tiers...');
      const tierData = [
        {
          name: 'Bronze',
          slug: 'bronze',
          description: 'Entry level tier',
          color: '#CD7F32',
          border_color: '#CD7F32',
          background_gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)',
          icon: '🥉',
          price_range_min: 10000,
          price_range_max: 50000,
          is_active: true,
          sort_order: 1
        },
        {
          name: 'Silver',
          slug: 'silver',
          description: 'Mid-tier level',
          color: '#C0C0C0',
          border_color: '#C0C0C0',
          background_gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
          icon: '🥈',
          price_range_min: 50000,
          price_range_max: 150000,
          is_active: true,
          sort_order: 2
        },
        {
          name: 'Gold',
          slug: 'gold',
          description: 'Premium tier',
          color: '#FFD700',
          border_color: '#FFD700',
          background_gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
          icon: '🥇',
          price_range_min: 150000,
          price_range_max: 500000,
          is_active: true,
          sort_order: 3
        }
      ];

      const { error: tiersError } = await supabase.from('tiers').insert(tierData);
      if (tiersError) {
        console.error('❌ Failed to populate tiers:', tiersError);
      } else {
        console.log('✅ Tiers populated successfully');
      }
    }

    if (!games || games.length === 0) {
      console.log('🎮 Populating missing game titles...');
      const gameData = [
        {
          name: 'Mobile Legends',
          slug: 'mobile-legends',
          description: 'Popular MOBA game',
          icon: '⚔️',
          color: '#1976D2',
          logo_url: '',
          is_popular: true,
          is_active: true,
          sort_order: 1
        },
        {
          name: 'Free Fire',
          slug: 'free-fire',
          description: 'Battle royale game',
          icon: '🔥',
          color: '#FF5722',
          logo_url: '',
          is_popular: true,
          is_active: true,
          sort_order: 2
        },
        {
          name: 'PUBG Mobile',
          slug: 'pubg-mobile',
          description: 'Battle royale survival',
          icon: '🎯',
          color: '#FF9800',
          logo_url: '',
          is_popular: true,
          is_active: true,
          sort_order: 3
        },
        {
          name: 'Valorant',
          slug: 'valorant',
          description: 'Tactical FPS game',
          icon: '🎮',
          color: '#F44336',
          logo_url: '',
          is_popular: false,
          is_active: true,
          sort_order: 4
        }
      ];

      const { error: gamesError } = await supabase.from('game_titles').insert(gameData);
      if (gamesError) {
        console.error('❌ Failed to populate game titles:', gamesError);
      } else {
        console.log('✅ Game titles populated successfully');
      }
    }

    return { success: true, message: 'Schema issues fixed successfully' };

  } catch (error) {
    console.error('💥 Failed to fix schema issues:', error);
    return { success: false, message: `Failed to fix issues: ${error}` };
  }
};
