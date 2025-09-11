# Guide to Managing Your Catalog

This guide explains how to manage your product catalog. Since all product data and image links are stored in a single configuration file, this guide is the most important piece of documentation for managing your content.

---

## How the Catalog Works

The entire catalog is controlled by one master file: `manifest.source.json`.

This file is a "database" that you edit manually. It is located in the main directory of your project. It contains a list of all your products and all the information associated with them.

When you run the `npm run deploy` command, a script automatically reads this master file and generates the optimized, paginated data files that the live website uses. **You should never edit the files in the `public/data` directory directly.**

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

**This is the URL you will use in your `manifest.source.json` file.** Repeat this process for every image you want to display.

---

## Section 2: Editing `manifest.source.json`

Now that you have your image URLs, you can add your products to the catalog. Open the `manifest.source.json` file in your text editor.

### `manifest.source.json` Structure

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

Here is an example of a complete product entry. You can copy and paste this into the `children` array in `manifest.source.json` and modify it with your own data.

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

---

## Section 3: Publishing Your Changes

After you have finished editing your `manifest.source.json` file with all your products and image links, you need to publish these changes to your live website.

Follow these steps every time you update the manifest:

**Step 1: Save Your Changes**
- Make sure you have saved the `manifest.source.json` file in your text editor.

**Step 2: Commit and Push the Changes to GitHub**
- You need to commit the changes to your `main` branch on GitHub. You can do this through your preferred Git tool (like GitHub Desktop) or via the command line.
- The only file you need to commit is `manifest.source.json`.

**Step 3: Deploy the Website**
- Open a terminal on your computer in the project's folder.
- Run the following command:
  `npm run deploy`
- This command will build the application and automatically push the final website files to the `gh-pages` branch, which makes it live.

**Step 4: View Your Live Site**
- Wait a few minutes (it can take 5-10 minutes for GitHub to update).
- Open your browser and go to your website URL: `https://your-username.github.io/Aureum-Vestis-Catalog/`
- You may need to do a "hard refresh" (`Ctrl+Shift+R` or `Cmd+Shift+R`) to see the latest changes.

That's it! Your catalog will be updated.
