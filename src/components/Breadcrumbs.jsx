function Breadcrumbs({ current }) {
  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      <a href="/" data-spa-link="true">Inicio</a>
      <span aria-hidden="true">/</span>
      <strong>{current}</strong>
    </nav>
  );
}

export default Breadcrumbs;
