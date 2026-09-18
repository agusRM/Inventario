import { useEffect, useState } from "react";
import { api, mediaUrl } from "../utils/api.js";

function CatalogPage({ onAdminLogin, onNavigate }) {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParts = async () => {
      try {
        setItems(await api.getParts());
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    loadParts();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const brands = [
    "Todas",
    ...Array.from(new Set(items.map((item) => item.brand_name?.trim()).filter(Boolean))).sort((first, second) => first.localeCompare(second)),
  ];
  const getBrandLogo = (brand) => {
    if (brand === "Todas") return null;
    const normalizedBrand = brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
    const logoName = normalizedBrand === "jac" ? "jac-motors" : normalizedBrand;
    const extension = logoName === "jac-motors" ? "png" : "svg";
    return `/logos_marcas_costa_rica/${logoName}.${extension}`;
  };
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleItems = items.filter((item) => {
    const searchableText = [item.name, item.part_number, item.brand_name, item.compatible_models, item.years]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesBrand = selectedBrand === "Todas" || item.brand_name === selectedBrand;
    return matchesSearch && matchesBrand;
  });

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

      <div className="brand-filters" aria-label="Filtrar por marca">
        <span className="brand-filters-label">Filtrar por marca</span>
        <div className="brand-filter-buttons">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              className={selectedBrand === brand ? "brand-filter-button active" : "brand-filter-button"}
              aria-pressed={selectedBrand === brand}
              onClick={() => setSelectedBrand(brand)}
            >
              {getBrandLogo(brand) && <img className="brand-filter-logo" src={getBrandLogo(brand)} alt="" aria-hidden="true" />}
              {brand}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="catalog-empty"><strong>{error}</strong><p>Verifica que la API y MySQL estén encendidos.</p></div> : visibleItems.length > 0 ? (
        <div className="table-wrapper catalog-table-wrapper">
          <table className="inventory-table catalog-table">
            <thead>
              <tr>
                <th>Fotos</th>
                <th>Repuesto</th>
                <th>Marca</th>
                <th>Número de pieza</th>
                <th>Modelos compatibles</th>
                <th>Años</th>
                <th>Precio</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const available = item.stock > item.minimum_stock;

                return (
                  <tr
                    key={item.part_number}
                    className="catalog-clickable-row"
                    role="button"
                    tabIndex="0"
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                    aria-label={`Ver detalles de ${item.name}`}
                  >
                    <td>
                      <div className="photo-gallery catalog-photo-gallery">
                        {item.photos.map((photo, index) => (
                          <img
                            key={photo}
                            className="product-photo"
                            src={mediaUrl(photo)}
                            alt={`${item.name}${item.brand_name ? ` marca ${item.brand_name}` : ""}, pieza ${item.part_number}, foto ${index + 1}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.brand_name || "Sin marca"}</td>
                    <td>{item.part_number}</td>
                    <td>{item.compatible_models || "-"}</td>
                    <td>{item.years}</td>
                    <td><strong>{formatCurrency(Number(item.price))}</strong></td>
                    <td>
                      <span className={available ? "catalog-stock" : "catalog-stock low"}>
                        {available ? "Disponible" : "No disponible"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="catalog-empty">
          <strong>No encontramos ese repuesto</strong>
          <p>Prueba con otra marca, modelo o número de pieza.</p>
        </div>
      )}

      {selectedItem && (
        <div className="catalog-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
          <section className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title">
            <div className="catalog-modal-header">
              <div>
                <span className="catalog-modal-eyebrow">Detalle del repuesto</span>
                <h2 id="catalog-modal-title">{selectedItem.name}</h2>
              </div>
              <button type="button" className="modal-close-button" aria-label="Cerrar detalle" onClick={() => setSelectedItem(null)}>X</button>
            </div>
            <div className="catalog-modal-content">
              <div className="catalog-modal-photos">
                {selectedItem.photos.length > 0 ? selectedItem.photos.map((photo, index) => (
                  <img key={photo} src={mediaUrl(photo)} className="catalog-modal-photo" alt={`${selectedItem.name}, foto ${index + 1}`} />
                )) : (
                  <div className="catalog-modal-no-photo">
                    <strong>Este repuesto no tiene fotos todavía.</strong>
                    <span>
                      Llame al <a href="tel:85074949">8507 4949</a> para solicitar fotos de la pieza e indique el número de pieza: {selectedItem.part_number}.
                    </span>
                  </div>
                )}
              </div>
              <dl className="catalog-modal-details">
                <div><dt>Marca</dt><dd>{selectedItem.brand_name || "Sin marca"}</dd></div>
                <div><dt>Número de pieza</dt><dd>{selectedItem.part_number}</dd></div>
                <div><dt>Modelos compatibles</dt><dd>{selectedItem.compatible_models || "No indicado"}</dd></div>
                <div><dt>Años</dt><dd>{selectedItem.years || "No indicado"}</dd></div>
                <div><dt>Precio</dt><dd>{formatCurrency(Number(selectedItem.price))}</dd></div>
                <div><dt>Disponibilidad</dt><dd>{selectedItem.stock > selectedItem.minimum_stock ? "Disponible" : "No disponible"}</dd></div>
                <div><dt>Anaquel</dt><dd>{selectedItem.shelf || "No indicado"}</dd></div>
                <div><dt>Proveedor</dt><dd>{selectedItem.supplier || "No indicado"}</dd></div>
              </dl>
            </div>
          </section>
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
