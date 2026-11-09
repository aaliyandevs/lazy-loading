
import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function getProducts() {
      setLoading(true);
      setError("");

      try {
        const url = `https://dummyjson.com/products?limit=10&skip=${page * 10}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = await response.json();

        if (!active) return;

        setProducts(oldProducts => [
          ...oldProducts,
          ...data.products
        ]);

        const loaded = page * 10 + data.products.length;

        if (loaded >= data.total || data.products.length === 0) {
          setHasMore(false);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load products.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getProducts();

    return () => {
      active = false;
    };
  }, [page, retry]);

  useEffect(() => {
    if (loading || !hasMore || error) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        setPage(current => current + 1);
      }
    }, { rootMargin: "100px" });

    const bottom = bottomRef.current;

    if (bottom) {
      observer.observe(bottom);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, error]);

  return (
    <div className="container">
      <h1>Products with Lazy Loading</h1>

      <div className="products">
        {products.map(product => (
          <div className="card" key={product.id}>
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
            />
            <h3>{product.title}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>

      <div ref={bottomRef}></div>

      {loading && <p>Loading products...</p>}

      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => setRetry(r => r + 1)}>
            Try Again
          </button>
        </div>
      )}

      {!hasMore && <p>All products loaded.</p>}
    </div>
  );
}

export default App;
