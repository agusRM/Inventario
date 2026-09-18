import { useEffect, useState } from "react";
import PartMaintenance from "./PartMaintenance.jsx";
import SiteFooter from "./SiteFooter.jsx";
import { api } from "../utils/api.js";

// Pantalla que se muestra después de iniciar sesión con éxito.
function WelcomeScreen({ username, role, onLogout }) {
  const [showInventory, setShowInventory] = useState(true);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    api.getParts().then(setParts).catch(() => setParts([]));
  }, []);

  const supplierCount = new Set(parts.map((part) => part.supplier?.trim()).filter(Boolean)).size;
  const lowStockCount = parts.filter((part) => part.stock <= part.minimum_stock).length;

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
          <strong>{parts.length}</strong>
          <p>Repuestos en stock</p>
        </article>
        <article className="summary-item">
          <strong>0</strong>
          <p>Órdenes de compra</p>
        </article>
        <article className="summary-item">
          <strong>{supplierCount}</strong>
          <p>Proveedores de repuestos</p>
        </article>
        <article className="summary-item">
          <strong>{lowStockCount}</strong>
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
      <SiteFooter />
    </section>
  );
}

export default WelcomeScreen;
