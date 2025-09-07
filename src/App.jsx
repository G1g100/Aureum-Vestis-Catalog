import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './App.css';

const CatalogItem = ({ item, basePath }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const itemPath = item.path.replace('public/', '');

  return (
    <div className={`catalog-item ${item.type}`}>
      <div onClick={handleClick} className="item-name">
        {item.name}
      </div>
      {isOpen && item.children && (
        <div className="catalog-children">
          {item.children.map((child) => (
            <CatalogItem key={child.name} item={child} basePath={basePath} />
          ))}
        </div>
      )}
      {item.type === 'file' && (
        <LazyLoadImage
          alt={item.name}
          effect="blur"
          src={`${basePath}${itemPath}`}
        />
      )}
    </div>
  );
};

function App() {
  const [manifest, setManifest] = useState(null);
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${basePath}manifest.json`)
      .then((response) => response.json())
      .then((data) => setManifest(data));
  }, [basePath]);

  return (
    <div className="App">
      <h1>Product Catalog</h1>
      <div className="catalog-container">
        {manifest &&
          manifest.children.map((item) => (
            <CatalogItem key={item.name} item={item} basePath={basePath} />
          ))}
      </div>
    </div>
  );
}

export default App;
