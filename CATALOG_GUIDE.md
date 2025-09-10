# Guide to Managing Your Catalog

This guide explains how to manage your product catalog. Since all product data and image links are stored in a single configuration file, this guide is the most important piece of documentation for managing your content.

---

## How the Catalog Works

The entire catalog is controlled by one file: `public/manifest.json`.

This file is a "database" that you edit manually. It contains a list of all your products and all the information associated with them, including the links to your externally hosted images. The application reads this file to build the catalog, the product pages, and the pagination.

---

## Section 1: Hosting Images on Google Drive

Before you can add a product to the catalog, its images must be uploaded to a hosting service. Here is a step-by-step tutorial on how to use Google Drive for this.

**Step 1: Upload Your Image**
- Go to your Google Drive (`drive.google.com`).
- Create a folder for your product images to stay organized.
- Upload the image file you want to use.

**Step 2: Get the Shareable Link**
- Right-click on the uploaded image file in Google Drive.
- Click **"Share"**, then click **"Share"** again.
- In the "General access" section, change it from "Restricted" to **"Anyone with the link"**. This is crucial.
- Click **"Copy link"**.

**Step 3: Extract the File ID**
- The link you copied will look like this:
  `https://drive.google.com/file/d/THIS_IS_THE_FILE_ID/view?usp=sharing`
- You need the long string of characters between `d/` and `/view`. This is your **File ID**.

**Step 4: Create the Direct Link**
- Take the File ID you just copied.
- Insert it into the following URL template:
  `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID`
- For example, if your File ID is `1wMgCWAsqlw0nXcMhCldTbwSznMdXUmBT`, your final, direct image URL will be:
  `https://drive.google.com/uc?export=view&id=1wMgCWAsqlw0nXcMhCldTbwSznMdXUmBT`

**This is the URL you will use in your `manifest.json` file.** Repeat this process for every image you want to display.

---

## Section 2: Editing `manifest.json`

Now that you have your image URLs, you can add your products to the catalog. Open the `public/manifest.json` file in a text editor.

### `manifest.json` Structure

The file contains a list of "children". Each "child" is a product object with the following fields:

- `id` (string, required): A unique identifier for this product (e.g., "si-passione").
- `name` (string, required): The full, display name of the product (e.g., "Sì Passione Eau de Parfum").
- `brand` (string, required): The brand name (e.g., "Giorgio Armani").
- `images` (array of strings, required): A list of the **direct image URLs** you created in Section 1.
- `variants` (array of objects, optional): A list of different versions of this product. Each variant object has:
  - `name` (string): The name of the variant (e.g., "Red Edition").
  - `image` (string): The direct URL to the variant's preview image.
  - `productId` (string): The unique `id` of the product page this variant should link to.
- `similar` (array of strings, optional): A list of product `id`s for similar items from the same brand.
- `recommended` (array of strings, optional): A list of product `id`s for recommended items from any brand.

### Example Product Entry

Here is an example of a complete product entry. You can copy and paste this into the `children` array in `manifest.json` and modify it with your own data.

```json
{
  "id": "si-passione",
  "name": "Sì Passione Eau de Parfum",
  "brand": "Giorgio Armani",
  "images": [
    "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_1",
    "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_2"
  ],
  "variants": [
    {
      "name": "Intense",
      "image": "https://drive.google.com/uc?export=view&id=YOUR_VARIANT_FILE_ID",
      "productId": "si-passione-intense"
    }
  ],
  "similar": [
    "my-way"
  ],
  "recommended": [
    "dior-sauvage"
  ]
}
```

After editing and saving `manifest.json`, the changes will appear in your application the next time you deploy it.
