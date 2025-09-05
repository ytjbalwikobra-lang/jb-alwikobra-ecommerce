#!/bin/bash

# JB AlwiKobra E-commerce - Database Migration Script
# This script helps deploy the new normalized database structure

echo "🚀 JB AlwiKobra E-commerce - Database Migration Deployment"
echo "========================================================"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "supabase" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Show migration files that will be deployed
echo ""
echo "📁 Migration files to be deployed:"
echo "=================================="
ls -la supabase/migrations/ | grep -E "(007|008|009)"

echo ""
echo "🔍 Migration Summary:"
echo "===================="
echo "• 007_create_tier_and_game_title_tables.sql - Creates normalized tiers and game_titles tables"
echo "• 008_update_products_table_structure.sql   - Adds foreign key relationships to products"
echo "• 009_finalize_dynamic_structure.sql        - Creates optimized view and sample data"

echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "==================="
echo "• These migrations will create new tables and relationships"
echo "• Existing data will be preserved for backward compatibility"
echo "• New foreign key columns will be added to products table"
echo "• Sample data will be inserted for testing"

echo ""
read -p "🤔 Do you want to proceed with the migration? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled by user"
    exit 1
fi

echo ""
echo "🔧 Starting migration process..."

# Check supabase login status
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

echo "✅ Supabase authentication verified"

# Show available projects
echo ""
echo "📋 Available Supabase projects:"
supabase projects list

echo ""
read -p "🎯 Enter your project reference ID: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference ID cannot be empty"
    exit 1
fi

# Link to project
echo "🔗 Linking to project $PROJECT_REF..."
supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo "❌ Failed to link to project"
    exit 1
fi

echo "✅ Successfully linked to project"

# Run migrations
echo ""
echo "🏗️  Deploying database migrations..."
echo "===================================="

supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 MIGRATION SUCCESSFUL!"
    echo "======================="
    echo "✅ All migrations have been deployed successfully"
    echo "✅ New tables: tiers, game_titles created"
    echo "✅ Foreign key relationships established"
    echo "✅ Sample data inserted"
    echo "✅ Optimized view created"
    echo ""
    echo "🔍 Next steps:"
    echo "• Test the application with real database data"
    echo "• Verify product cards show dynamic styling"
    echo "• Check that filters work with dynamic data"
    echo "• Monitor database performance"
    echo ""
    echo "📖 For detailed analysis, see: LAPORAN_ANALISIS_STATE.md"
else
    echo ""
    echo "❌ MIGRATION FAILED!"
    echo "==================="
    echo "Please check the error messages above and resolve any issues."
    echo "You may need to:"
    echo "• Check database permissions"
    echo "• Verify migration file syntax"
    echo "• Ensure no conflicting data exists"
    exit 1
fi

# Optional: Show database status
echo ""
read -p "🔍 Do you want to verify the database structure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔍 Database Structure Verification:"
    echo "==================================="
    
    echo "📊 Checking tables..."
    supabase db diff --schema public | head -20
    
    echo ""
    echo "📈 For complete database inspection, you can:"
    echo "• Use Supabase Dashboard: https://app.supabase.com/project/$PROJECT_REF"
    echo "• Run: supabase db diff --schema public"
    echo "• Check the application frontend for dynamic data"
fi

echo ""
echo "🎯 Deployment Complete!"
echo "======================"
echo "Your JB AlwiKobra e-commerce platform is now running with:"
echo "• Normalized database structure"
echo "• Dynamic tier and game title data"
echo "• Enhanced product cards with dynamic styling" 
echo "• Removed price filters as requested"
echo ""
echo "🚀 Happy coding!"
