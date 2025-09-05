#!/bin/bash

echo "🧹 CLEANING UP WORKSPACE AND APP FROM DEV FILES"
echo "================================================"
echo ""

# Dev/Debug files to remove
DEV_FILES=(
    # Documentation files (can be moved to docs/ or removed)
    "ADMIN_FIX_SUMMARY.md"
    "CATALOG_REDESIGN_SUMMARY.md"
    "CONFIRMED_DATABASE_OK.md"
    "DEPLOYMENT.md"
    "IMMEDIATE_PERFORMANCE_FIX_GUIDE.md"
    "LAPORAN_ANALISIS_STATE.md"
    "MOBILE_UX_IMPROVEMENTS.md"
    "PANDUAN_MIGRASI.md"
    "PERFORMANCE_ANALYSIS.md"
    "PERFORMANCE_OPTIMIZATION_COMPLETE.sh"
    "PRECISE_PERFORMANCE_FIX.md"
    "PRODUCTION_DEBUG_GUIDE.md"
    "PRODUCTION_READY_CHECKLIST.md"
    "PRODUCTION_TEST_SCRIPT.md"
    "QUICK_REFERENCE.md"
    "UI_UPDATES_COMPLETE.sh"
    "WHATSAPP_DEBUG_SUMMARY.md"
    "WHATSAPP_INTEGRATION.md"
    
    # SQL debug files
    "alternative-constraint-fix.sql"
    "check_products.sql"
    "cleanup-and-verify.sql"
    "debug-constraint-detail.sql"
    "debug-production-database-fixed.sql"
    "debug-production-database.sql"
    "debug_order_creation.sql"
    "debug_schema.sql"
    "diagnostic-constraint.sql"
    "fix-unique-constraint.sql"
    "remove_category_column.sql"
    "simple-production-test.sql"
    "step-by-step-fix.sql"
    "test-manual-orders.sql"
    "test-valid-uuid.sql"
    "test_order_simple.sql"
    
    # JavaScript/Python debug files
    "debug_whatsapp_direct.js"
    "debug_xendit.py"
    "test-footer-data.js"
    "test-order-creation.js"
    "test-uuid-validation.js"
    "test_dynamic_data.js"
    
    # Shell scripts (debug)
    "deploy-migrations.sh"
    "fix-admin-performance.sh"
    "test-production-api.sh"
    "test-whatsapp-group.sh"
    
    # Performance/development files
    "QUICK_ADMIN_PERFORMANCE_PATCH.js"
    "performance-indexes.sql"
    "PRODUCTION_PERFORMANCE_FIX.sql"
    "SUPABASE_PRODUCTION_CHECKLIST.sql"
    
    # API debug files
    "api/debug-whatsapp.ts"
)

# Create backup directory first
echo "📦 Creating backup directory..."
mkdir -p ./dev-files-backup

# Move files to backup
echo "🔄 Moving dev files to backup..."
moved_count=0
for file in "${DEV_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "./dev-files-backup/"
        echo "   ✅ Moved: $file"
        ((moved_count++))
    fi
done

# Clean up empty scripts directory if exists
if [ -d "scripts" ] && [ -z "$(ls -A scripts)" ]; then
    echo "🗂️  Removing empty scripts directory..."
    rmdir scripts
fi

echo ""
echo "🎯 CLEANUP SUMMARY:"
echo "==================="
echo "📦 Files moved to backup: $moved_count"
echo "🗂️  Backup location: ./dev-files-backup/"
echo ""
echo "✅ PRODUCTION-READY FILES REMAINING:"
echo "📁 src/ - Application source code"
echo "📁 public/ - Static assets"
echo "📁 api/ - Vercel API endpoints"
echo "📁 supabase/ - Database migrations"
echo "📁 build/ - Production build"
echo "📄 package.json - Dependencies"
echo "📄 vercel.json - Deployment config"
echo "📄 tailwind.config.js - Styling config"
echo "📄 postcss.config.js - CSS config"
echo "📄 README.md - Project documentation"
echo "📄 LICENSE - License file"
echo ""
echo "⚠️  DEV FILES BACKED UP TO: ./dev-files-backup/"
echo "You can safely delete the backup folder once confirmed everything works"
echo ""
echo "🚀 Workspace is now clean and production-ready!"
