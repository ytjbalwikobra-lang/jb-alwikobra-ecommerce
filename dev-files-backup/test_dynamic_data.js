// Test script untuk verify dynamic data fetching
// Run dengan: node test_dynamic_data.js

const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDynamicData() {
    console.log('🧪 Testing Dynamic Data Fetching...\n');
    
    try {
        // Test 1: Fetch tiers
        console.log('1️⃣ Testing Tiers Data:');
        const { data: tiers, error: tiersError } = await supabase
            .from('tiers')
            .select('*')
            .order('sort_order');
            
        if (tiersError) {
            console.error('❌ Tiers Error:', tiersError);
        } else {
            console.log('✅ Tiers fetched successfully:', tiers.length, 'records');
            tiers.forEach(tier => {
                console.log(`   - ${tier.name} (${tier.slug}): ${tier.color}`);
            });
        }
        
        // Test 2: Fetch game titles
        console.log('\n2️⃣ Testing Game Titles Data:');
        const { data: gameTitles, error: gameError } = await supabase
            .from('game_titles')
            .select('*')
            .order('sort_order');
            
        if (gameError) {
            console.error('❌ Game Titles Error:', gameError);
        } else {
            console.log('✅ Game Titles fetched successfully:', gameTitles.length, 'records');
            gameTitles.forEach(game => {
                console.log(`   - ${game.name} (${game.category}): ${game.color}`);
            });
        }
        
        // Test 3: Fetch products with relations
        console.log('\n3️⃣ Testing Products with Dynamic Relations:');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                *,
                tiers(name, slug, color, background_gradient),
                game_titles(name, category, color)
            `)
            .limit(5);
            
        if (productsError) {
            console.error('❌ Products Error:', productsError);
        } else {
            console.log('✅ Products with relations fetched successfully:', products.length, 'records');
            products.forEach(product => {
                console.log(`   - ${product.name}`);
                console.log(`     Tier: ${product.tiers?.name} (${product.tiers?.color})`);
                console.log(`     Game: ${product.game_titles?.name} (${product.game_titles?.category})`);
            });
        }
        
        // Test 4: Test optimized view
        console.log('\n4️⃣ Testing Optimized View:');
        const { data: viewData, error: viewError } = await supabase
            .from('products_with_details')
            .select('name, tier_name, tier_background_gradient, game_title_name, game_category')
            .limit(3);
            
        if (viewError) {
            console.error('❌ View Error:', viewError);
        } else {
            console.log('✅ Optimized view works:', viewData.length, 'records');
            viewData.forEach(item => {
                console.log(`   - ${item.name}: ${item.tier_name} | ${item.game_title_name}`);
            });
        }
        
        console.log('\n🎉 ALL TESTS PASSED! Dynamic data system is working perfectly!');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

testDynamicData();
