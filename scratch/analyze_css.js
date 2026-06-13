import fs from 'fs';
const css = fs.readFileSync('scratch/style.css', 'utf8');

// Find lines containing the colors
const lines = css.split(/[{};]/);
console.log('CSS rules containing colors:');
lines.forEach(line => {
  if (line.includes('#4b7e27') || line.includes('#03873d') || line.includes('#07863d') || line.includes('#ffc200') || line.includes('rgba(16,8,206') || line.includes('#337ab7') || line.includes('#106bff')) {
    console.log(line.trim());
  }
});
