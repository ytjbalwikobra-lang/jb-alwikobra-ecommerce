#!/usr/bin/env node
/**
 * Normalize relative import specifiers by removing explicit .ts/.tsx extensions.
 * This avoids TS2691 errors in CRA/TypeScript builds.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');

/** Regex patterns covering static, dynamic, and export star imports */
const patterns = [
  /(from\s+['"](\.\.?\/[^'";\n]*?))\.tsx(['"])/g,
  /(from\s+['"](\.\.?\/[^'";\n]*?))\.ts(['"])/g,
  /(import\(\s*['"](\.\.?\/[^'";\n]*?))\.tsx(['"]\s*\))/g,
  /(import\(\s*['"](\.\.?\/[^'";\n]*?))\.ts(['"]\s*\))/g,
  /(export\s+\*\s+from\s+['"](\.\.?\/[^'";\n]*?))\.tsx(['"])/g,
  /(export\s+\*\s+from\s+['"](\.\.?\/[^'";\n]*?))\.ts(['"])/g
];

let changedFiles = 0;

function processFile(file) {
  if (!/\.(tsx?|jsx?)$/.test(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const re of patterns) {
    content = content.replace(re, '$1$3');
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else processFile(full);
  }
}

walk(SRC_DIR);
console.log(`Normalized import extensions in ${changedFiles} file(s).`);
