function ProviderTable() {
  const providers = [
    {
      name: "Frenos Andinos",
      contact: "ventas@frenosandinos.com",
      phone: "+57 601 555 0142",
      country: "Colombia",
      rating: 4.8,
      averageDelivery: "2-3 días",
      activeProducts: 18,
      lastOrder: "2026-08-02",
    },
    {
      name: "MotorParts MX",
      contact: "ventas@motorpartsmx.com",
      phone: "+52 55 1234 5678",
      country: "México",
      rating: 4.4,
      averageDelivery: "4-5 días",
      activeProducts: 12,
      lastOrder: "2026-08-06",
    },
    {
      name: "Autopartes del Sur",
      contact: "pedidos@autopartesdelsur.cl",
      phone: "+56 2 2345 6789",
      country: "Chile",
      rating: 4.6,
      averageDelivery: "1-2 días",
      activeProducts: 24,
      lastOrder: "2026-08-08",
    },
  ];

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <h2>Proveedores activos</h2>
        <p>Proveedores y tiempos de entrega de repuestos automotrices.</p>
      </div>

      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Contacto</th>
              <th>País</th>
              <th>Rating</th>
              <th>Entrega</th>
              <th>Productos</th>
              <th>Último pedido</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.name}>
                <td>{provider.name}</td>
                <td>
                  <div className="provider-contact">
                    <strong>{provider.contact}</strong>
                    <span>{provider.phone}</span>
                  </div>
                </td>
                <td>{provider.country}</td>
                <td>{provider.rating.toFixed(1)}</td>
                <td>{provider.averageDelivery}</td>
                <td>{provider.activeProducts}</td>
                <td>{provider.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProviderTable;
