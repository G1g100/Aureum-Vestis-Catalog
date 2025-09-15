import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './App.css';

// --- Components ---

const ProductPreview = ({ product }) => {
  if (!product) return null;
  return (
    <Link to={`/product/${product.id}`} className="product-preview">
      <LazyLoadImage alt={product.name} effect="blur" src={product.images[0]} />
      <div className="preview-name">{product.name}</div>
    </Link>
  );
};

const VariantPreview = ({ variant }) => {
  if (!variant) return null;
  return (
    <Link to={`/product/${variant.productId}`} className="product-preview">
      <LazyLoadImage alt={variant.name} effect="blur" src={variant.image} />
      <div className="preview-name">{variant.name}</div>
    </Link>
  );
};

const CatalogItem = ({ item }) => {
  return (
    <Link to={`/product/${item.id}`} className={`catalog-item`}>
      <div className="item-name">{item.name}</div>
      {item.images && item.images.length > 0 && (
        <LazyLoadImage alt={item.name} effect="blur" src={item.images[0]} />
      )}
    </Link>
  );
};

const Header = ({ basePath }) => {
  const logoPath = `${basePath}logo.png`;
  return (
    <header className="app-header">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <img src={logoPath} alt="Brand Logo" className="logo" />
        <h1>Aureum Vestis Catalog</h1>
      </Link>
    </header>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination-controls">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

// --- Pages ---

const HomePage = ({ meta }) => {
  // Now, this page will show brands instead of products
  const brands = [...new Set(meta.products.map(p => p.brand))];

  return (
    <>
      <div className="info-box">
        <p>
          Il nostro catalogo è in continuo aggiornamento... Seleziona un brand per iniziare.
        </p>
      </div>
      <div className="brands-container">
        {brands.map(brand => (
          <Link key={brand} to={`/brands/${brand}`} className="brand-link">
            {brand}
          </Link>
        ))}
      </div>
    </>
  );
};

const CategoryPage = ({ meta }) => {
  const { brandName, categoryName } = useParams();

  const keywords = ["scarpe", "magliette", "tute", "giacca", "orologio", "profumo", "borsa", "cintura", "zaino"];

  const getSubCategory = (productName) => {
    const name = ` ${productName.toLowerCase()} `;
    for (const keyword of keywords) {
      if (name.includes(` ${keyword} `)) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }
    }
    return "Altro";
  };

  const productsByBrand = meta.products.filter(p => p.brand === brandName);

  const subCategories = [...new Set(productsByBrand.map(p => getSubCategory(p.name)))];

  const products = productsByBrand.filter(p => {
    if (categoryName) {
      return getSubCategory(p.name).toLowerCase() === categoryName.toLowerCase();
    }
    return true; // Show all products of the brand if no category is selected
  });

  if (!categoryName) {
    return (
      <div className="brands-container">
        {subCategories.map(subCategory => (
          <Link key={subCategory} to={`/brands/${brandName}/${subCategory.toLowerCase()}`} className="brand-link">
            {subCategory}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="catalog-container">
      {products.map((item) => (
        <CatalogItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const ProductPage = ({ meta }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (meta && meta.products) {
      const foundProduct = meta.products.find(p => p.id === productId);
      setProduct(foundProduct);
    }
    window.scrollTo(0, 0);
  }, [meta, productId]);

  if (!product) {
    return <div className="loading-message">Loading product...</div>;
  }

  const renderRelatedItems = (productIds) => {
    if (!productIds || productIds.length === 0) return null;
    return productIds
      .map(id => meta.products.find(p => p.id === id))
      .filter(Boolean)
      .map(relatedProduct => <ProductPreview key={relatedProduct.id} product={relatedProduct} />);
  };

  return (
    <div className="product-page">
      <Link to="/" className="back-link back-link-top">← Back to Catalog</Link>

      <div className="product-layout">
        <div className="product-images">
          {product.images.map((image, index) => (
            <LazyLoadImage key={index} alt={`${product.name} ${index + 1}`} effect="blur" src={image} />
          ))}
        </div>

        <div className="product-details">
          <div className="product-header">
            <h2 className="product-title">{product.name}</h2>
            <h3 className="product-brand">{product.brand}</h3>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="related-section">
              <h4>Variants</h4>
              <div className="related-items">
                {product.variants.map(variant => <VariantPreview key={variant.productId} variant={variant} />)}
              </div>
            </div>
          )}
          {product.similar && product.similar.length > 0 && (
            <div className="related-section">
              <h4>Similar Items</h4>
              <div className="related-items">{renderRelatedItems(product.similar)}</div>
            </div>
          )}
          {product.recommended && product.recommended.length > 0 && (
            <div className="related-section">
              <h4>Recommended for you</h4>
              <div className="related-items">{renderRelatedItems(product.recommended)}</div>
            </div>
          )}
        </div>
      </div>

      <Link to="/" className="back-link back-link-bottom">← Back to Catalog</Link>
    </div>
  );
};

// --- Main App ---

function App() {
  const [products, setProducts] = useState([]);
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${basePath}data/manifest.json`)
      .then(res => res.json())
      .then(data => setProducts(data.products))
      .catch(err => console.error("Failed to load metadata manifest:", err));
  }, [basePath]);

  if (products.length === 0) {
    return <div className="loading-message">Initializing Catalog...</div>;
  }

  const meta = { products }; // Create meta object to pass to components

  return (
    <BrowserRouter basename={basePath}>
      <div className="App">
        <Header basePath={basePath} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage meta={meta} />} />
            <Route path="/brands" element={<HomePage meta={meta} />} />
            <Route path="/brands/:brandName" element={<CategoryPage meta={meta} />} />
            <Route path="/brands/:brandName/:categoryName" element={<CategoryPage meta={meta} />} />
            <Route path="/product/:productId" element={<ProductPage meta={meta} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
