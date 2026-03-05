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
                let relativePathToToast = path.relative(path.dirname(filePath), path.join(srcPath, 'components', 'common', 'toast')).replace(/\\/g, '/');
                if (!relativePathToToast.startsWith('.')) {
                    relativePathToToast = './' + relativePathToToast;
                }

                let relativePathToContainer = path.relative(path.dirname(filePath), path.join(srcPath, 'components', 'common', 'ToastContainer')).replace(/\\/g, '/');
                if (!relativePathToContainer.startsWith('.')) {
                    relativePathToContainer = './' + relativePathToContainer;
                }

                // 1. Handle: import { Toaster } from 'react-hot-toast';
                //    or      import { Toaster, ... } from 'react-hot-toast';
                if (content.match(/import\s*\{[^}]*Toaster[^}]*\}\s*from\s+['"]react-hot-toast['"];?/)) {
                    content = content.replace(/import\s*\{[^}]*Toaster[^}]*\}\s*from\s+['"]react-hot-toast['"];?/g, `import ToastContainer from '${relativePathToContainer}';`);
                    content = content.replace(/<Toaster[^>]*>/g, '<ToastContainer />');
                    content = content.replace(/<\/Toaster>/g, '');
                }

                // 2. Handle: import toast from 'react-hot-toast';
                content = content.replace(/import\s+toast\s*from\s+['"]react-hot-toast['"];?/g, `import toast from '${relativePathToToast}';`);

                // 3. Handle: import { toast } from 'react-hot-toast'; (just in case)
                content = content.replace(/import\s*\{\s*toast\s*\}\s*from\s+['"]react-hot-toast['"];?/g, `import toast from '${relativePathToToast}';`);

                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated', filePath);
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
