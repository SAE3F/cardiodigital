const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Backgrounds
  content = content.replace(/bg-slate-950/g, 'bg-background');
  content = content.replace(/bg-slate-900\/50/g, 'bg-muted/50');
  content = content.replace(/bg-slate-900\/40/g, 'bg-muted/40');
  content = content.replace(/bg-slate-900\/20/g, 'bg-muted/20');
  content = content.replace(/bg-slate-900/g, 'bg-card');
  content = content.replace(/bg-slate-800\/50/g, 'bg-accent/50');
  content = content.replace(/bg-slate-800/g, 'bg-accent');
  content = content.replace(/bg-slate-700/g, 'bg-secondary');
  content = content.replace(/bg-slate-100/g, 'bg-foreground');

  // Text
  content = content.replace(/text-slate-50/g, 'text-foreground');
  content = content.replace(/text-slate-100/g, 'text-foreground');
  content = content.replace(/text-slate-200/g, 'text-foreground');
  content = content.replace(/text-slate-300/g, 'text-muted-foreground');
  content = content.replace(/text-slate-400/g, 'text-muted-foreground');
  content = content.replace(/text-slate-500/g, 'text-muted-foreground');
  content = content.replace(/text-slate-800/g, 'text-background');
  content = content.replace(/text-slate-900/g, 'text-background');
  content = content.replace(/text-slate-950/g, 'text-background');

  // Borders
  content = content.replace(/border-slate-800\/50/g, 'border-border/50');
  content = content.replace(/border-slate-800/g, 'border-border');
  content = content.replace(/border-slate-700\/50/g, 'border-border/50');
  content = content.replace(/border-slate-700/g, 'border-border');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walk(path.join(__dirname, 'app'));
walk(path.join(__dirname, 'components'));
