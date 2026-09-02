import { useState } from "react";
import PartMaintenance from "./PartMaintenance.jsx";

// Pantalla que se muestra después de iniciar sesión con éxito.
function WelcomeScreen({ username, role, onLogout }) {
  const [showInventory, setShowInventory] = useState(true);

  const handleToggleInventory = () => {
    setShowInventory((current) => !current);
  };

  return (
    <section className="welcome-card">
      <div className="branding-bar">
        <img className="brand-logo" src="/logo-surepuesto.jpg" alt="Logo de SuRepuesto" />
        <div>
          <h1>Bienvenido, {username}</h1>
              <p>Panel de control del inventario de repuestos automotrices.</p>
        </div>
      </div>

      <div className="summary-grid">
        <article className="summary-item">
          <strong>128</strong>
          <p>Repuestos en stock</p>
        </article>
        <article className="summary-item">
          <strong>6</strong>
          <p>Órdenes de compra</p>
        </article>
        <article className="summary-item">
          <strong>12</strong>
          <p>Proveedores de repuestos</p>
        </article>
        <article className="summary-item">
          <strong>4</strong>
          <p>Alertas de bajo stock</p>
        </article>
      </div>

      <div className="action-list">
        <button type="button" className="btn-primary" onClick={handleToggleInventory}>
          {showInventory ? "Ocultar repuestos" : "Mantenimiento de repuestos"}
        </button>
        <button type="button" className="btn-primary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      {showInventory && <PartMaintenance role={role} />}
    </section>
  );
}

export default WelcomeScreen;
