function SalesReport() {
  const reportItems = [
    {
      month: "Enero",
      totalSales: 12440,
      orders: 92,
      averageTicket: 135,
      returns: 4,
    },
    {
      month: "Febrero",
      totalSales: 15620,
      orders: 108,
      averageTicket: 145,
      returns: 2,
    },
    {
      month: "Marzo",
      totalSales: 14290,
      orders: 99,
      averageTicket: 144,
      returns: 5,
    },
  ];

  const formatCurrency = (value) =>
    value.toLocaleString("es-ES", { style: "currency", currency: "USD" });

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <h2>Reporte de ventas</h2>
        <p>Resumen mensual de ventas de repuestos y desempeño comercial.</p>
      </div>

      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ventas totales</th>
              <th>Pedidos</th>
              <th>Ticket promedio</th>
              <th>Devoluciones</th>
            </tr>
          </thead>
          <tbody>
            {reportItems.map((item) => (
              <tr key={item.month}>
                <td>{item.month}</td>
                <td>{formatCurrency(item.totalSales)}</td>
                <td>{item.orders}</td>
                <td>{formatCurrency(item.averageTicket)}</td>
                <td>{item.returns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesReport;
