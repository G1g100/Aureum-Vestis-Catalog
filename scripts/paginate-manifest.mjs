import fs from 'fs';
import path from 'path';

const SOURCE_PATH = 'manifest.source.json';
const OUTPUT_DIR = 'public/data';
const ITEMS_PER_PAGE = 50;

try {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read the source manifest
  const sourceContent = fs.readFileSync(SOURCE_PATH, 'utf8');
  const sourceData = JSON.parse(sourceContent);

  const allProducts = sourceData.children || [];
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  console.log(`Found ${totalProducts} products. Splitting into ${totalPages} pages of ${ITEMS_PER_PAGE} items each.`);

  // Create paginated files
  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = allProducts.slice(startIndex, endIndex);
    const pagePath = path.join(OUTPUT_DIR, `page-${i + 1}.json`);
    fs.writeFileSync(pagePath, JSON.stringify(pageData, null, 2));
    console.log(`Wrote ${pageData.length} items to ${pagePath}`);
  }

  // Create a new main manifest with metadata and a full list of product IDs for searching
  const mainManifest = {
    name: sourceData.name,
    totalProducts: totalProducts,
    totalPages: totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    products: allProducts.map(p => ({ id: p.id, name: p.name, brand: p.brand, images: p.images, variants: p.variants, similar: p.similar, recommended: p.recommended })) // Create a full index for product page lookups
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(mainManifest, null, 2));
  console.log(`Wrote main manifest to ${manifestPath}`);

  console.log('Manifest pagination successful!');

} catch (error) {
  console.error('Error during manifest pagination:', error);
  process.exit(1); // Exit with an error code
}
