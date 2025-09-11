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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`./data/page-${currentPage}.json`)
      .then(res => res.json())
      .then(data => {
        setPageData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load page ${currentPage}:`, err);
        setIsLoading(false);
      });
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= meta.totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div className="info-box">
        <p>
          Il nostro catalogo è in continuo aggiornamento...
        </p>
      </div>
      <PaginationControls currentPage={currentPage} totalPages={meta.totalPages} onPageChange={handlePageChange} />
      {isLoading ? (
        <div className="loading-message">Loading Page {currentPage}...</div>
      ) : (
        <div className="catalog-container">
          {pageData.map((item) => (
            <CatalogItem key={item.id} item={item} />
          ))}
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={meta.totalPages} onPageChange={handlePageChange} />
    </>
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
      <Link to="/" className="back-link">Back to Catalog</Link>
    </div>
  );
};

// --- Main App ---

function App() {
  const [meta, setMeta] = useState(null);
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${basePath}data/manifest.json`)
      .then(res => res.json())
      .then(data => setMeta(data))
      .catch(err => console.error("Failed to load metadata manifest:", err));
  }, [basePath]);

  if (!meta) {
    return <div className="loading-message">Initializing Catalog...</div>;
  }

  return (
    <BrowserRouter basename={basePath}>
      <div className="App">
        <Header basePath={basePath} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage meta={meta} />} />
            <Route path="/product/:productId" element={<ProductPage meta={meta} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
