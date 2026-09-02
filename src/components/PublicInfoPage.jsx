import Breadcrumbs from "./Breadcrumbs.jsx";

const pageContent = {
  faq: {
    title: "Preguntas frecuentes",
    intro: "Respuestas rápidas sobre nuestro catálogo y la atención en Palmares.",
  },
  cases: {
    title: "Casos de éxito",
    intro: "Historias de clientes que encontraron la pieza correcta a tiempo.",
  },
};

function PublicInfoPage({ type, onCatalog }) {
  const content = pageContent[type];

  return (
    <section className="catalog-page info-page">
      <header className="info-header">
        <div className="brand-lockup">
          <img className="brand-logo" src="/logo-surepuesto.jpg" alt="Logo de SuRepuesto" />
          <span className="app-badge">SuRepuesto | Palmares</span>
        </div>
        <button type="button" className="catalog-admin-button" onClick={onCatalog}>Volver al catálogo</button>
      </header>
      <Breadcrumbs current={content.title} />
      <h1>{content.title}</h1>
      <p className="info-intro">{content.intro}</p>

      {type === "faq" ? (
        <div className="faq-list">
          <details open><summary>¿Cómo consulto un repuesto?</summary><p>Busca por nombre, marca, modelo o número de pieza en el catálogo.</p></details>
          <details><summary>¿Los precios están actualizados?</summary><p>Los precios publicados corresponden a la información disponible en nuestro inventario.</p></details>
          <details><summary>¿Puedo solicitar una pieza que no aparece?</summary><p>Sí. Escríbenos o llámanos y revisaremos disponibilidad con nuestros proveedores.</p></details>
          <details><summary>¿Dónde están ubicados?</summary><p>Estamos en Palmares de Alajuela. Puedes contactarnos al 8507 4949.</p></details>
        </div>
      ) : (
        <div className="success-grid">
          <article><span>01</span><h2>La pieza correcta</h2><p>Un cliente encontró pastillas compatibles para su Corolla usando el número de pieza y evitó una compra incorrecta.</p></article>
          <article><span>02</span><h2>Respuesta rápida</h2><p>Una consulta por disponibilidad permitió resolver una reparación urgente con una batería lista para entrega.</p></article>
          <article><span>03</span><h2>Inventario claro</h2><p>La búsqueda por modelo ayudó a comparar opciones nuevas y de segunda antes de visitar la tienda.</p></article>
        </div>
      )}

      <div className="info-cta">
        <strong>¿No encuentras lo que necesitas?</strong>
        <a href="tel:85074949">Llamar al 8507 4949</a>
      </div>
    </section>
  );
}

export function ThankYouPage({ onCatalog, onLogin }) {
  return (
    <section className="catalog-page info-page centered-page">
      <Breadcrumbs current="Cuenta creada" />
      <div className="thank-you-mark" aria-hidden="true">✓</div>
      <h1>Gracias por registrarte</h1>
      <p className="info-intro">Tu cuenta fue creada correctamente. Ya puedes iniciar sesión para consultar el panel.</p>
      <div className="maintenance-actions centered-actions">
        <button type="button" className="btn-primary" onClick={onLogin}>Iniciar sesión</button>
        <button type="button" className="btn-secondary" onClick={onCatalog}>Volver al catálogo</button>
      </div>
    </section>
  );
}

export function NotFoundPage({ onCatalog }) {
  return (
    <section className="catalog-page info-page centered-page">
      <Breadcrumbs current="Página no encontrada" />
      <div className="not-found-code">404</div>
      <h1>Esta página no existe</h1>
      <p className="info-intro">La dirección puede estar escrita de forma incorrecta o ya no estar disponible.</p>
      <button type="button" className="btn-primary" onClick={onCatalog}>Ir al catálogo</button>
    </section>
  );
}

export default PublicInfoPage;
