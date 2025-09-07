import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './App.css';

// --- Helper Functions ---

const findProductById = (node, productId) => {
  if (node.isProduct && node.id === productId) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findProductById(child, productId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};


// --- Components ---

const ProductPreview = ({ product, basePath }) => {
  if (!product) return null;
  return (
    <Link to={`/product/${product.id}`} className="product-preview">
      <LazyLoadImage
        alt={product.name}
        effect="blur"
        src={`${basePath}${product.path.replace('public', '')}/${product.images[0]}`}
      />
      <div className="preview-name">{product.name}</div>
    </Link>
  );
};

const VariantPreview = ({ variant, basePath, productPath }) => {
  if (!variant) return null;
  return (
    <Link to={`/product/${variant.productId}`} className="product-preview">
      <LazyLoadImage
        alt={variant.name}
        effect="blur"
        src={`${basePath}${productPath.replace('public', '')}/${variant.image}`}
      />
      <div className="preview-name">{variant.name}</div>
    </Link>
  );
};

const CatalogItem = ({ item, basePath }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (item.type === 'folder' && !item.isProduct) {
      setIsOpen(!isOpen);
    }
  };

  const itemPath = item.path.replace('public/', '');
  const content = (
    <>
      <div className="item-name">{item.name}</div>
      {item.isProduct && item.images && item.images.length > 0 && (
        <LazyLoadImage
          alt={item.name}
          effect="blur"
          src={`${basePath}${item.path.replace('public', '')}/${item.images[0]}`}
        />
      )}
      {isOpen && item.children && (
        <div className="catalog-children">
          {item.children.map((child) => (
            <CatalogItem key={child.path} item={child} basePath={basePath} />
          ))}
        </div>
      )}
    </>
  );

  if (item.isProduct) {
    return (
      <Link to={`/product/${item.id}`} className={`catalog-item ${item.type}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`catalog-item ${item.type}`} onClick={handleClick}>
      {content}
    </div>
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

// --- Pages ---

const HomePage = ({ manifest, basePath }) => (
  <>
    <div className="info-box">
      <p>
        Il nostro catalogo è in continuo aggiornamento e contiene migliaia di
        articoli. Se non trovi quello che cerchi, non esitare a contattarci!
        Inviaci il nome, una foto o un link del prodotto che desideri e
        faremo il possibile per trovarlo per te.
      </p>
    </div>
    <div className="catalog-container">
      {manifest &&
        manifest.children.map((item) => (
          <CatalogItem key={item.path} item={item} basePath={basePath} />
        ))}
    </div>
  </>
);

const ProductPage = ({ manifest, basePath }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (manifest) {
      const foundProduct = findProductById(manifest, productId);
      setProduct(foundProduct);
    }
     // When the product changes, scroll to the top of the page
    window.scrollTo(0, 0);
  }, [manifest, productId]);

  if (!product) {
    return (
      <div className="product-page">
        <h2>Loading product...</h2>
      </div>
    );
  }

  const renderRelatedItems = (productIds) => {
    if (!productIds || productIds.length === 0) return null;
    return productIds
      .map(id => findProductById(manifest, id))
      .filter(Boolean) // Filter out any nulls if a product isn't found
      .map(relatedProduct => (
        <ProductPreview key={relatedProduct.id} product={relatedProduct} basePath={basePath} />
      ));
  };

  const renderVariants = (variants) => {
    if (!variants || variants.length === 0) return null;
    return variants.map(variant => (
      <VariantPreview key={variant.productId} variant={variant} basePath={basePath} productPath={product.path} />
    ));
  };

  return (
    <div className="product-page">
      <div className="product-header">
        <h2 className="product-title">{product.name}</h2>
        <h3 className="product-brand">{product.brand}</h3>
      </div>

      <div className="product-images">
        {product.images.map((image, index) => (
          <LazyLoadImage
            key={index}
            alt={`${product.name} ${index + 1}`}
            effect="blur"
            src={`${basePath}${product.path.replace('public', '')}/${image}`}
          />
        ))}
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="related-section">
          <h4>Variants</h4>
          <div className="related-items">
            {renderVariants(product.variants)}
          </div>
        </div>
      )}

      {product.similar && product.similar.length > 0 && (
        <div className="related-section">
          <h4>Similar Items</h4>
          <div className="related-items">
            {renderRelatedItems(product.similar)}
          </div>
        </div>
      )}

      {product.recommended && product.recommended.length > 0 && (
        <div className="related-section">
          <h4>Recommended for you</h4>
          <div className="related-items">
            {renderRelatedItems(product.recommended)}
          </div>
        </div>
      )}

      <Link to="/" className="back-link">Back to Catalog</Link>
    </div>
  );
};

// --- Main App ---

function App() {
  const [manifest, setManifest] = useState(null);
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${basePath}manifest.json`)
      .then((response) => response.json())
      .then((data) => setManifest(data));
  }, [basePath]);

  return (
    <BrowserRouter basename={basePath}>
      <div className="App">
        <Header basePath={basePath} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage manifest={manifest} basePath={basePath} />} />
            <Route path="/product/:productId" element={<ProductPage manifest={manifest} basePath={basePath} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
