const fs = require('fs');
const path = require('path');

const dirTree = (filename) => {
  const stats = fs.lstatSync(filename);
  const info = {
    path: filename.replace(/\\/g, '/'), // Normalize path for windows
    name: path.basename(filename),
  };

  if (stats.isDirectory()) {
    info.type = 'folder';
    const children = fs.readdirSync(filename);

    // Check for a product.json file
    const productInfoPath = path.join(filename, 'product.json');
    if (fs.existsSync(productInfoPath)) {
      try {
        const productInfo = JSON.parse(fs.readFileSync(productInfoPath));
        // Merge product info into the folder's info object
        Object.assign(info, productInfo);
        info.isProduct = true; // Add a flag to identify this folder as a product
      } catch (e) {
        console.error(`Error parsing JSON for ${productInfoPath}`, e);
      }
    }

    // Filter out product.json from children and recurse
    info.children = children
      .filter(child => child !== 'product.json')
      .map(child => dirTree(path.join(filename, child)));
  } else {
    info.type = 'file';
  }

  return info;
};

const manifest = dirTree(path.join('public', 'images'));

fs.writeFileSync(
  path.join('public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('Manifest generated successfully.');
