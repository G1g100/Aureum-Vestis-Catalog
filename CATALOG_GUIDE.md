# How to Manage Your Product Catalog

This guide explains how to add new products and manage their details in your catalog application.

## Adding a New Product

Adding a new product is as simple as adding a new folder inside the `public/images` directory. The application will automatically detect the new folder and display it.

For example, to add a new brand called "Armani", you would create a new folder: `public/images/Armani`.

To add a product called "Si Passione" under that brand, you would create another folder: `public/images/Armani/Si-Passione`.

## Defining Product Details with `product.json`

To make a folder a "product" that users can click on to see a detailed page, you must place a `product.json` file inside it. This file contains all the details for that specific product.

**Location:** `public/images/YourBrand/YourProduct/product.json`

### Structure of `product.json`

Here is a breakdown of each field in the `product.json` file:

- `id` (string, required): A unique identifier for this product. **This must be unique across the entire catalog.** A good practice is to use the folder name (e.g., "si-passione").
- `name` (string, required): The full, display name of the product (e.g., "Sì Passione Eau de Parfum").
- `brand` (string, required): The brand name (e.g., "Giorgio Armani").
- `images` (array of strings, required): A list of image file names that will be shown in the product page's image gallery. These images must be in the same folder as the `product.json` file or in a subfolder.
- `variants` (array of objects, optional): A list of different versions of this product (e.g., different colors or sizes). Each variant object has:
  - `name` (string): The name of the variant (e.g., "Red Edition").
  - `image` (string): The path to the variant's preview image, relative to the product folder.
  - `productId` (string): The unique `id` of the product page this variant should link to.
- `similar` (array of strings, optional): A list of product `id`s for items from the **same brand** that you want to show in the "Similar Items" section.
- `recommended` (array of strings, optional): A list of product `id`s for items from **any brand** that you want to show in the "Recommended for you" section.

### Example `product.json`

You can copy and paste this template into your product folder and edit the values.

```json
{
  "id": "si-passione",
  "name": "Sì Passione Eau de Parfum",
  "brand": "Giorgio Armani",
  "images": [
    "si-passione-main.jpg",
    "si-passione-bottle.jpg",
    "si-passione-box.jpg"
  ],
  "variants": [
    {
      "name": "Intense",
      "image": "variants/si-passione-intense.jpg",
      "productId": "si-passione-intense"
    }
  ],
  "similar": [
    "my-way",
    "acqua-di-gioia"
  ],
  "recommended": [
    "dior-sauvage",
    "chanel-no-5"
  ]
}
```

By following this structure, you can easily manage and expand your product catalog. The application will automatically update when you next build or deploy it.
