const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const srcDir = path.join(__dirname, '../src');
const uiDir = path.join(srcDir, 'components/ui');

// Get all source files
const allFiles = getAllFiles(srcDir, []);

// Get all UI components
const uiComponents = fs.readdirSync(uiDir)
  .filter(file => file.endsWith('.tsx') && file !== 'ImageCropper.tsx') // Keep ImageCropper if we haven't deleted it yet, actually we should check that too.
  .map(file => file.replace(/\.tsx$/, ''));

const usedComponents = new Set();

allFiles.forEach(file => {
  // Read file content
  const content = fs.readFileSync(file, 'utf8');
  
  uiComponents.forEach(component => {
    // Check various import styles
    const importStyle1 = new RegExp(`from ['"]@/components/ui/${component}['"]`);
    const importStyle2 = new RegExp(`from ['"]\.\./ui/${component}['"]`);
    const importStyle3 = new RegExp(`from ['"]\.\./\.\./components/ui/${component}['"]`);
    // Some are exported from single index files, but mainly shadcn uses direct imports.
    
    if (importStyle1.test(content) || importStyle2.test(content) || importStyle3.test(content)) {
      usedComponents.add(component);
    }
  });
});

const unusedComponents = uiComponents.filter(c => !usedComponents.has(c));

console.log("UNUSED COMPONENTS:");
unusedComponents.forEach(c => console.log(c));

// Optionally, delete them right away
unusedComponents.forEach(c => {
  if (c !== 'button' && c !== 'dialog' && c !== 'input' && c !== 'label' && c !== 'tabs') {
      console.log(`Deleting ${c}.tsx...`);
      fs.unlinkSync(path.join(uiDir, `${c}.tsx`));
  }
});

// Let's also delete ImageCropper.tsx because we fully replaced it
if (fs.existsSync(path.join(uiDir, 'ImageCropper.tsx'))) {
  console.log("Deleting ImageCropper.tsx...");
  fs.unlinkSync(path.join(uiDir, 'ImageCropper.tsx'));
}

console.log("Cleanup finished.");
