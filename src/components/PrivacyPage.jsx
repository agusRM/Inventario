import Breadcrumbs from "./Breadcrumbs.jsx";

function PrivacyPage({ onCatalog }) {
  return (
    <section className="catalog-page info-page privacy-page">
      <header className="info-header">
        <div className="brand-lockup">
          <img className="brand-logo" src="/logo-surepuesto.jpg" alt="Logo de SuRepuesto" />
          <span className="app-badge">SuRepuesto | Palmares</span>
        </div>
        <button type="button" className="catalog-admin-button" onClick={onCatalog}>Volver al catálogo</button>
      </header>
      <Breadcrumbs current="Política de privacidad" />
      <h1>Política de privacidad</h1>
      <p className="info-intro">En SuRepuesto tratamos tus datos con responsabilidad y solo los usamos para atender tus solicitudes y operar tu cuenta.</p>
      <div className="privacy-content">
        <section><h2>Datos que recopilamos</h2><p>Podemos solicitar nombre de usuario, correo electrónico y la información que compartas al consultar disponibilidad. No almacenamos datos de tarjetas de pago.</p></section>
        <section><h2>Para qué los usamos</h2><p>Usamos estos datos para crear y administrar cuentas, responder consultas y mejorar la atención. No vendemos información personal a terceros.</p></section>
        <section><h2>Conservación y seguridad</h2><p>Protegemos las contraseñas mediante hash y limitamos el acceso administrativo. Conservamos los datos mientras sean necesarios para prestar el servicio.</p></section>
        <section><h2>Tus derechos</h2><p>Puedes solicitar acceso, corrección o eliminación de tus datos contactándonos al 8507 4949.</p></section>
      </div>
      <p className="privacy-updated">Última actualización: 2 de septiembre de 2026.</p>
    </section>
  );
}

export default PrivacyPage;
