#!/bin/bash

# Mobile Performance Testing Script
# Tests the optimized build and provides performance metrics

echo "🚀 Mobile Performance Testing Suite"
echo "=================================="

# Check if build exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Running build first..."
    npm run build
fi

echo ""
echo "📊 Bundle Size Analysis"
echo "----------------------"

# Get main bundle size
MAIN_BUNDLE=$(find build/static/js -name "main.*.js" -exec ls -la {} \; | awk '{print $5}')
MAIN_BUNDLE_KB=$((MAIN_BUNDLE / 1024))

echo "Main Bundle Size: ${MAIN_BUNDLE_KB} KB"

# Count total chunks
CHUNK_COUNT=$(find build/static/js -name "*.chunk.js" | wc -l)
echo "Total Chunks: ${CHUNK_COUNT}"

# Get CSS size
CSS_SIZE=$(find build/static/css -name "*.css" -exec ls -la {} \; | awk '{print $5}' | head -1)
CSS_SIZE_KB=$((CSS_SIZE / 1024))
echo "CSS Bundle Size: ${CSS_SIZE_KB} KB"

echo ""
echo "🎯 Performance Checklist"
echo "------------------------"

# Check for lazy loading implementation
if grep -q "React.lazy" src/App.tsx; then
    echo "✅ Lazy loading implemented"
else
    echo "❌ Lazy loading missing"
fi

# Check for OptimizedImage usage
if [ -f "src/components/OptimizedImage.tsx" ]; then
    echo "✅ OptimizedImage component created"
else
    echo "❌ OptimizedImage component missing"
fi

# Check for critical CSS
if grep -q "criticalCSS" src/utils/criticalCSS.ts; then
    echo "✅ Critical CSS system implemented"
else
    echo "❌ Critical CSS system missing"
fi

# Check for dynamic imports
DYNAMIC_IMPORTS=$(grep -r "await import" src/ | wc -l)
echo "✅ Dynamic imports found: ${DYNAMIC_IMPORTS}"

# Check for intersection observer usage
if grep -q "IntersectionObserver" src/components/OptimizedImage.tsx; then
    echo "✅ Intersection Observer implemented"
else
    echo "❌ Intersection Observer missing"
fi

echo ""
echo "📱 Mobile-First Features"
echo "-----------------------"

# Check for mobile optimizations
if grep -q "rootMargin" src/components/OptimizedImage.tsx; then
    echo "✅ Optimized viewport detection"
else
    echo "❌ Viewport detection needs optimization"
fi

# Check for resource preloader
if [ -f "src/utils/resourcePreloader.ts" ]; then
    echo "✅ Resource preloader system"
else
    echo "❌ Resource preloader missing"
fi

echo ""
echo "🎯 Performance Score Estimation"
echo "-------------------------------"

SCORE=50  # Starting score

# Bundle size improvements
if [ $MAIN_BUNDLE_KB -lt 110 ]; then
    SCORE=$((SCORE + 15))
    echo "+15 points: Bundle size under 110KB"
fi

# Lazy loading
if grep -q "React.lazy" src/App.tsx; then
    SCORE=$((SCORE + 10))
    echo "+10 points: Lazy loading implemented"
fi

# Image optimization
if [ -f "src/components/OptimizedImage.tsx" ]; then
    SCORE=$((SCORE + 8))
    echo "+8 points: Image optimization system"
fi

# Critical CSS
if [ -f "src/utils/criticalCSS.ts" ]; then
    SCORE=$((SCORE + 5))
    echo "+5 points: Critical CSS system"
fi

# Dynamic imports
if [ $DYNAMIC_IMPORTS -gt 3 ]; then
    SCORE=$((SCORE + 7))
    echo "+7 points: Multiple dynamic imports"
fi

echo ""
echo "📊 Estimated Mobile Score: ${SCORE}/100"

if [ $SCORE -ge 90 ]; then
    echo "🏆 EXCELLENT - Ready for production!"
elif [ $SCORE -ge 75 ]; then
    echo "🎯 GOOD - Minor optimizations needed"
elif [ $SCORE -ge 60 ]; then
    echo "⚡ FAIR - Continue with Phase 2 optimizations"
else
    echo "🔧 NEEDS WORK - Continue optimization phases"
fi

echo ""
echo "🚀 Next Steps"
echo "-------------"

if [ $SCORE -lt 75 ]; then
    echo "1. Deploy current changes and test on real devices"
    echo "2. Implement Phase 2: Image optimization"
    echo "3. Add WebP/AVIF format support"
    echo "4. Implement responsive images"
fi

if [ $SCORE -lt 85 ]; then
    echo "5. Implement Phase 3: Critical resource optimization"
    echo "6. Add service worker for caching"
    echo "7. Optimize font loading"
fi

if [ $SCORE -lt 95 ]; then
    echo "8. Implement Phase 4: Advanced features"
    echo "9. Add performance monitoring"
    echo "10. Implement route-based prefetching"
fi

echo ""
echo "💡 Tip: Run 'npm run build:analyze' for detailed bundle analysis"
echo "🔗 Test on real devices using Vercel deployment for accurate scores"
