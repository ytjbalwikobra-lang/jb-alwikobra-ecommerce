const fs = require('fs');
const path = require('path');

// Function to remove console statements from a file
function removeConsoleStatements(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Remove console.log, console.error, console.warn, etc.
    const consoleRegex = /\s*console\.[a-zA-Z]+\([^;]*\);?\n?/g;
    updatedContent = updatedContent.replace(consoleRegex, '');
    
    // Clean up any empty lines left behind
    updatedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Removed console statements from: ${filePath}`);
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
      removeConsoleStatements(filePath);
    }
  });
}

console.log('🚀 Starting console statements cleanup...');
processDirectory('./src');
console.log('✨ Console statements cleanup completed!');
