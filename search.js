const fs = require('fs');
const contents = fs.readFileSync('e:\\AiDemo\\HTQUANTRIVIETBACH\\app.js', 'utf8');
const lines = contents.split('\n');
lines.forEach((line, index) => {
    if (line.includes('renderQuanLyCongVan')) {
        console.log(`Found at line ${index + 1}: ${line.trim()}`);
    }
});
