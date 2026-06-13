import fs from 'fs';
const css = fs.readFileSync('scratch/style.css', 'utf8');

// find declarations of linear-gradient
const matches = css.match(/[^{}]+\{[^}]*linear-gradient[^}]*\}/g) || [];
matches.forEach(m => console.log(m.trim()));
