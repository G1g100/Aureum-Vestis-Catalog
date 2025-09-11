import fs from 'fs';

const inputFile = 'manifest.source.json';
const outputFile = 'manifest.source.json';

// Function to generate a clean, URL-friendly slug
const slugify = (str) => {
  if (!str) {
    return '';
  }
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return str.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// Function to clean the name for display
const cleanDisplayName = (str) => {
    if (!str) {
        return '';
    }
    // A more aggressive cleaning for the name field to make it more readable
    return str.replace(/\[\d{4}-\d{2}-\d{2}\]/, '') // remove date-like patterns
              .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
              .replace(/[!$@#%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/g, '') // remove special characters
              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
              .trim();
}


// Read the manifest file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
    return;
  }

  try {
    const manifest = JSON.parse(data);
    const idMap = new Map();

    // Ensure manifest.children is an array before mapping
    if (!Array.isArray(manifest.children)) {
      throw new Error('manifest.children is not an array');
    }

    // Process each item in the manifest
    const cleanedChildren = manifest.children.map(item => {
      const newName = cleanDisplayName(item.name);
      let newId = slugify(newName) || slugify(item.id); // fallback to original id if name is empty

      if (idMap.has(newId)) {
        const count = idMap.get(newId);
        idMap.set(newId, count + 1);
        newId = `${newId}-${count}`;
      } else {
        idMap.set(newId, 1);
      }

      return {
        ...item,
        id: newId,
        name: newName,
      };
    });

    const cleanedManifest = {
      ...manifest,
      children: cleanedChildren
    };

    // Write the cleaned data back to the file
    fs.writeFile(outputFile, JSON.stringify(cleanedManifest, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file to disk: ${err}`);
      } else {
        console.log(`Successfully cleaned and updated ${outputFile}`);
      }
    });

  } catch (err) {
    console.error(`Error processing manifest: ${err}`);
  }
});
