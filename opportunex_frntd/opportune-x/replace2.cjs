const fs = require('fs');
const path = require('path');
const srcPath = path.join(process.cwd(), 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findAndReplace(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('/toast\'') || content.includes('/toast";')) {
                let newContent = content.replace(/from\s+['"]([^'"]*)\/toast['"]/g, "from '$1/toastManager'");
                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log('Fixed export in', filePath);
                }
            }
        }
    }
}

try {
    findAndReplace(srcPath);
    console.log("Done");
} catch (e) {
    console.log("Error:", e);
}
