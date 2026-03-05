const fs = require('fs');
const path = require('path');
const srcPath = path.join(process.cwd(), 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findAndReplace(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('react-hot-toast')) {
                let relativePath = path.relative(path.dirname(filePath), path.join(srcPath, 'components', 'common', 'toast')).replace(/\\/g, '/');
                if (!relativePath.startsWith('.')) {
                    relativePath = './' + relativePath;
                }

                // Remove old imports
                let newContent = content.replace(/import\s+toast\s*from\s+['"]react-hot-toast['"];?/g, `import toast from '${relativePath}';`);

                // Handle variations
                newContent = newContent.replace(/import\s+\{\s*Toaster\s*,\s*toast\s*\}\s*from\s+['"]react-hot-toast['"];?/g, `import toast from '${relativePath}';\nimport ToastContainer from '${relativePath.replace('toast', 'ToastContainer')}';`);

                newContent = newContent.replace(/import\s+toast,\s*\{\s*Toaster\s*\}\s*from\s+['"]react-hot-toast['"];?/g, `import toast from '${relativePath}';\nimport ToastContainer from '${relativePath.replace('toast', 'ToastContainer')}';`);

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log('Updated', filePath);
                }
            }
        }
    }
}
findAndReplace(srcPath);
