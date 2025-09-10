import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './App.css';

// --- Helper Functions ---

const findProductById = (manifest, productId) => {
  if (!manifest || !manifest.children) return null;
  return manifest.children.find(p => p.id === productId);
};


// --- Components ---

const ProductPreview = ({ product }) => {
  if (!product) return null;
  return (
    <Link to={`/product/${product.id}`} className="product-preview">
      <LazyLoadImage
        alt={product.name}
        effect="blur"
        src={product.images[0]} // Use absolute URL directly
      />
      <div className="preview-name">{product.name}</div>
    </Link>
  );
};

const VariantPreview = ({ variant }) => {
  if (!variant) return null;
  return (
    <Link to={`/product/${variant.productId}`} className="product-preview">
      <LazyLoadImage
        alt={variant.name}
        effect="blur"
        src={variant.image} // Use absolute URL directly
      />
      <div className="preview-name">{variant.name}</div>
    </Link>
  );
};

const CatalogItem = ({ item }) => {
  return (
    <Link to={`/product/${item.id}`} className={`catalog-item`}>
      <div className="item-name">{item.name}</div>
      {item.images && item.images.length > 0 && (
        <LazyLoadImage
          alt={item.name}
          effect="blur"
          src={item.images[0]} // Use absolute URL directly
        />
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
  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <div className="pagination-controls">
      <button onClick={handlePrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={handleNext} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

// --- Pages ---

const HomePage = ({ manifest }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  if (!manifest || !manifest.children) {
    return <div className="loading-message">Loading catalog...</div>;
  }

  const totalItems = manifest.children.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = manifest.children.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div className="info-box">
        <p>
          Il nostro catalogo è in continuo aggiornamento e contiene migliaia di
          articoli. Se non trovi quello che cerchi, non esitare a contattarci!
          Inviaci il nome, una foto o un link del prodotto che desideri e
          faremo il possibile per trovarlo per te.
        </p>
      </div>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      <div className="catalog-container">
        {currentItems.map((item) => (
          <CatalogItem key={item.id} item={item} />
        ))}
      </div>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  );
};

const ProductPage = ({ manifest }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (manifest) {
      const foundProduct = findProductById(manifest, productId);
      setProduct(foundProduct);
    }
    window.scrollTo(0, 0);
  }, [manifest, productId]);

  if (!product) {
    return <div className="loading-message">Loading product...</div>;
  }

  const renderRelatedItems = (productIds) => {
    if (!productIds || productIds.length === 0) return null;
    return productIds
      .map(id => findProductById(manifest, id))
      .filter(Boolean)
      .map(relatedProduct => (
        <ProductPreview key={relatedProduct.id} product={relatedProduct} />
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
          <LazyLoadImage key={index} alt={`${product.name} ${index + 1}`} effect="blur" src={image} />
        ))}
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="related-section">
          <h4>Variants</h4>
          <div className="related-items">
            {product.variants.map(variant => (
              <VariantPreview key={variant.productId} variant={variant} />
            ))}
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
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setManifest(data))
      .catch(err => console.error("Failed to load or parse manifest.json:", err));
  }, [basePath]);

  return (
    <BrowserRouter basename={basePath}>
      <div className="App">
        <Header basePath={basePath} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage manifest={manifest} />} />
            <Route path="/product/:productId" element={<ProductPage manifest={manifest} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
