const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const UNUSED_IMPORTS = [
  'ResponsiveImage',
  'Settings',
  'Lock',
  'Sun',
  'Globe',
  'ChevronRight',
  'ShoppingBag',
  'Zap',
  'generatePurchaseMessage',
  'AlertCircle',
  'Footer',
  'generateSellAccountMessage',
  'useMemo',
  'useState',
  'useEffect',
  'Truck',
  'createClient',
  'supabase',
  'RawWebsiteSettings',
  'RawUser',
  'RawBanner',
  'StrictMode',
  'lazy',
  'formatDisplayPhone',
  'deletePublicUrls'
];

// Function to remove unused imports from a file
function removeUnusedImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    UNUSED_IMPORTS.forEach(importName => {
      // Remove from destructured imports
      const destructuredRegex = new RegExp(`\\s*,\\s*${importName}\\s*,?`, 'g');
      updatedContent = updatedContent.replace(destructuredRegex, '');
      
      // Remove from single imports
      const singleImportRegex = new RegExp(`import\\s+${importName}\\s+from[^;]+;\\n?`, 'g');
      updatedContent = updatedContent.replace(singleImportRegex, '');
      
      // Clean up empty import lines
      updatedContent = updatedContent.replace(/import\s*{\s*}\s*from[^;]+;\n?/g, '');
      
      // Clean up trailing commas in destructured imports
      updatedContent = updatedContent.replace(/{\s*,/g, '{');
      updatedContent = updatedContent.replace(/,\s*}/g, '}');
    });
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed unused imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      removeUnusedImports(filePath);
    }
  });
}

console.log('🚀 Starting unused imports cleanup...');
processDirectory('./src');
console.log('✨ Unused imports cleanup completed!');
