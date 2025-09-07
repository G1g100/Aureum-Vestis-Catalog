const fs = require('fs');
const path = require('path');

const dirTree = (filename) => {
  const stats = fs.lstatSync(filename);
  const info = {
    path: filename,
    name: path.basename(filename),
  };

  if (stats.isDirectory()) {
    info.type = 'folder';
    info.children = fs.readdirSync(filename).map(child => dirTree(path.join(filename, child)));
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
