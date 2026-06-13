import fs from 'fs';
const css = fs.readFileSync('scratch/style.css', 'utf8');
const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
const rgbRegex = /rgb[a]?\([^)]+\)/g;

const hexMatches = css.match(hexRegex) || [];
const rgbMatches = css.match(rgbRegex) || [];

const counts = {};
[...hexMatches, ...rgbMatches].forEach(color => {
  const normalized = color.toLowerCase();
  counts[normalized] = (counts[normalized] || 0) + 1;
});

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log('Most frequent colors in style.css:');
sorted.slice(0, 30).forEach(([color, count]) => {
  console.log(`${color}: ${count} times`);
});
