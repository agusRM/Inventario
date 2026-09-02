import { useEffect, useState } from "react";
import { api, mediaUrl } from "../utils/api.js";

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getParts().then(setItems).catch((loadError) => setError(loadError.message));
  }, []);

  const formatCurrency = (value) =>
    value.toLocaleString("es-ES", { style: "currency", currency: "USD" });

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <h2>Inventario de repuestos</h2>
        <p>Existencias, costos y ubicación de las piezas automotrices.</p>
      </div>

      {error && <p className="error-message">{error}</p>}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Nombre de la pieza</th>
              <th>Marca</th>
              <th>Foto</th>
              <th>Fecha de ingreso</th>
              <th>Número de pieza</th>
              <th>Modelos</th>
              <th>Años</th>
              <th>Stock</th>
              <th>Stock mínimo</th>
              <th>Anaquel</th>
              <th>Bodega</th>
              <th>Precio unitario</th>
              <th>Valor del stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const totalValue = item.stock * Number(item.price);
              const lowStock = item.stock <= item.minimum_stock;

              return (
                <tr key={item.part_number} className={lowStock ? "low-stock" : ""}>
                  <td>
                    <div className="product-cell">
                      <div>
                        <span>{item.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>{item.brand_name || "Sin marca"}</td>
                  <td>
                    <div className="photo-gallery">
                      {item.photos.map((photo, photoIndex) => (
                        <img
                          key={photo}
                          className="product-photo"
                          src={mediaUrl(photo)}
                          alt={`${item.name}${item.brand_name ? ` marca ${item.brand_name}` : ""}, pieza ${item.part_number}, foto ${photoIndex + 1}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td>{item.entry_date}</td>
                  <td>{item.part_number}</td>
                  <td>{item.compatible_models || "-"}</td>
                  <td>{item.years}</td>
                  <td>
                    <div className="stock-cell">
                      <span>{item.stock}</span>
                    </div>
                  </td>
                  <td>{item.minimum_stock}</td>
                  <td>{item.shelf || "-"}</td>
                  <td>{item.supplier || "-"}</td>
                  <td>{formatCurrency(Number(item.price))}</td>
                  <td>{formatCurrency(totalValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
