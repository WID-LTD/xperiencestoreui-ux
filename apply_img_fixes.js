const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add loading="lazy" if it doesn't have it
    content = content.replace(/<img\s+(?![^>]*\bloading=["']lazy["'])/g, '<img loading="lazy" ');
    
    // Add default onerror if it doesn't have it
    content = content.replace(/<img(?![^>]*\bonerror=)[^>]*src=["']\$\{([^}]*)\}["'][^>]*>/g, (match) => {
        // Find where to insert onerror
        return match.replace(/<img\s+/, `<img onerror="this.src='/assets/placeholder.png'; this.onerror=null;" `);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

processFile(path.join(__dirname, 'pages.js'));
processFile(path.join(__dirname, 'components.js'));
