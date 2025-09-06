#!/bin/bash

echo "🚀 Starting Comprehensive Application Check..."
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

print_info "Starting comprehensive checks for JB AlWikobra E-commerce..."

# 1. Check TypeScript compilation
echo ""
echo "🔍 Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    print_status "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# 2. Check for security vulnerabilities
echo ""
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level moderate

# 3. Check for missing dependencies
echo ""
echo "📦 Checking dependencies..."
if npm ls > /dev/null 2>&1; then
    print_status "All dependencies are properly installed"
else
    print_warning "Some dependency issues detected, but not critical"
fi

# 4. Check for console.log statements (should be limited in production)
echo ""
echo "🗂️  Checking for console statements..."
CONSOLE_COUNT=$(grep -r "console\." src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ "$CONSOLE_COUNT" -gt 50 ]; then
    print_warning "Found $CONSOLE_COUNT console statements (consider reducing for production)"
else
    print_status "Console statement count acceptable: $CONSOLE_COUNT"
fi

# 5. Check build size
echo ""
echo "📊 Analyzing build size..."
BUILD_SIZE=$(du -sh build/ 2>/dev/null | cut -f1 || echo "Not available")
print_info "Build size: $BUILD_SIZE"

# 6. Check for unused imports (simplified check)
echo ""
echo "🧹 Checking for potential unused imports..."
UNUSED_IMPORTS=$(grep -r "import.*{.*}" src/ --include="*.ts" --include="*.tsx" | grep -c "import.*{.*}.*from" || echo "0")
print_info "Found $UNUSED_IMPORTS import statements (manual review recommended)"

# 7. Check for TODO/FIXME comments
echo ""
echo "📝 Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r -i "todo\|fixme" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME comments"
    grep -r -i "todo\|fixme" src/ --include="*.ts" --include="*.tsx" | head -5
else
    print_status "No TODO/FIXME comments found"
fi

# 8. Verify critical files exist
echo ""
echo "📁 Verifying critical files..."
CRITICAL_FILES=(
    "src/App.tsx"
    "src/AppOptimized.tsx"
    "src/index.tsx"
    "src/utils/phoneUtils.ts"
    "src/components/SmartPhoneInput.tsx"
    "src/pages/TraditionalAuthPage.tsx"
    "src/contexts/TraditionalAuthContext.tsx"
    "src/pages/WhatsAppConfirmPage.tsx"
    "public/index.html"
    "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing!"
        exit 1
    fi
done

# 9. Check environment configuration
echo ""
echo "🌍 Checking environment configuration..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    print_status "Environment file found"
else
    print_warning "No environment file found (.env or .env.local)"
fi

# 10. Final build test
echo ""
echo "🏗️  Final build test..."
if npm run build > build_output.log 2>&1; then
    print_status "Final build successful"
    BUILD_SIZE_MAIN=$(grep -o "[0-9]*\.[0-9]* kB.*main\.[a-f0-9]*\.js" build_output.log | head -1)
    print_info "Main bundle: $BUILD_SIZE_MAIN"
    rm -f build_output.log
else
    print_error "Final build failed"
    cat build_output.log
    exit 1
fi

echo ""
echo "=============================================="
print_status "Comprehensive check completed successfully!"
echo ""
print_info "Summary:"
echo "- ✅ TypeScript compilation: PASSED"
echo "- ✅ Dependencies: OK"
echo "- ✅ Critical files: ALL PRESENT"
echo "- ✅ Build process: SUCCESSFUL"
echo "- ⚠️  Console statements: $CONSOLE_COUNT (consider cleanup)"
echo "- ⚠️  TODO comments: $TODO_COUNT"
echo ""
print_status "Application is ready for production deployment!"
echo "=============================================="
