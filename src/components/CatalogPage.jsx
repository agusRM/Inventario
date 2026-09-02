import { useEffect, useState } from "react";
import { api, mediaUrl } from "../utils/api.js";

function CatalogPage({ onAdminLogin, onNavigate }) {
  const [search, setSearch] = useState("");
  const [visibleItems, setVisibleItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParts = async () => {
      try {
        setVisibleItems(await api.getParts(search.trim()));
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    loadParts();
  }, [search]);

  const formatCurrency = (value) =>
    value.toLocaleString("es-ES", { style: "currency", currency: "USD" });

  return (
    <section className="catalog-page">
      <header className="catalog-header">
        <div>
          <div className="brand-lockup">
            <img className="brand-logo" src="/logo-surepuesto.jpg" alt="Logo de SuRepuesto" />
            <span className="app-badge">SuRepuesto | Palmares</span>
          </div>
          <h1>Catálogo de repuestos</h1>
          <p>Repuestos de calidad, nuevos y de segunda al mejor precio.</p>
          <p className="catalog-brands">Suzuki · Toyota · JAC · Changan</p>
          <p className="response-promise">Respuesta inicial en menos de 15 minutos durante nuestro horario de atención.</p>
        </div>
        <div className="catalog-header-actions">
          <button type="button" className="catalog-admin-button" onClick={onAdminLogin}>Acceso administrativo</button>
          <nav className="internal-links" aria-label="Enlaces informativos">
            <a href="/faq" onClick={(event) => { event.preventDefault(); onNavigate("/faq"); }}>Preguntas frecuentes</a>
            <a href="/casos-de-exito" onClick={(event) => { event.preventDefault(); onNavigate("/casos-de-exito"); }}>Casos de éxito</a>
          </nav>
        </div>
      </header>

      <div className="catalog-search">
        <label htmlFor="catalog-search-input">Buscar repuesto</label>
        <input
          id="catalog-search-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ej. Brembo, Corolla, REP-001..."
        />
        <span>{visibleItems.length} repuestos encontrados</span>
      </div>

      {error ? <div className="catalog-empty"><strong>{error}</strong><p>Verifica que la API y MySQL estén encendidos.</p></div> : visibleItems.length > 0 ? (
        <div className="catalog-grid">
          {visibleItems.map((item) => (
            <article className="catalog-item" key={item.part_number}>
              <div className="catalog-photo-gallery">
                {item.photos.map((photo, index) => (
                  <img
                    key={photo}
                    src={mediaUrl(photo)}
                    alt={`${item.name}${item.brand_name ? ` marca ${item.brand_name}` : ""}, pieza ${item.part_number}, foto ${index + 1}`}
                  />
                ))}
              </div>
              <div className="catalog-item-content">
                <div className="catalog-item-title">
                  <span>{item.brand_name || "Sin marca"}</span>
                  <strong>{item.name}</strong>
                </div>
                <dl className="catalog-details">
                  <div><dt>Pieza</dt><dd>{item.part_number}</dd></div>
                  <div><dt>Modelos</dt><dd>{item.compatible_models || "-"}</dd></div>
                  <div><dt>Años</dt><dd>{item.years}</dd></div>
                </dl>
                <div className="catalog-item-footer">
                  <strong>{formatCurrency(Number(item.price))}</strong>
                  <span className={item.stock <= item.minimum_stock ? "catalog-stock low" : "catalog-stock"}>
                    {item.stock > item.minimum_stock ? "Disponible" : "No disponible"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <strong>No encontramos ese repuesto</strong>
          <p>Prueba con otra marca, modelo o número de pieza.</p>
        </div>
      )}

      <footer className="catalog-contact">
        <div>
          <strong>Estamos ubicados en Palmares de Alajuela</strong>
          <span>Un gusto atenderles · Tel. 8507 4949</span>
        </div>
        <a
          href="https://www.facebook.com/share/1G7tSM6QrD/"
          target="_blank"
          rel="noreferrer"
        >
          Visítanos en Facebook
        </a>
        <a href="/privacidad" onClick={(event) => { event.preventDefault(); onNavigate("/privacidad"); }}>Política de privacidad</a>
      </footer>

      <section className="location-section" aria-labelledby="location-title">
        <div>
          <h2 id="location-title">Visítanos en Palmares</h2>
          <p>Palmares de Alajuela, Costa Rica</p>
          <p>Tel. 8507 4949</p>
          <a className="btn-secondary location-link" href="https://www.google.com/maps/place/10%C2%B002'46.0%22N+84%C2%B025'52.9%22W/@10.0461195,-84.4320413,18z/data=!4m4!3m3!8m2!3d10.0460968!4d-84.4313736?hl=es&entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer">Abrir direcciones en Google Maps</a>
        </div>
        <iframe className="location-map" title="Mapa de SuRepuesto en Palmares de Alajuela" src="https://www.google.com/maps?q=10.0460968,-84.4313736&z=18&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </section>
      <a className="mobile-cta" href="tel:85074949">Llamar ahora · 8507 4949</a>
    </section>
  );
}

export default CatalogPage;
