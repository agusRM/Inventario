import { useEffect, useState } from "react";
import { api } from "../utils/api.js";

function UserTable() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getUsers().then(setUsers).catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <h2>Mantenimiento de usuarios</h2>
        <p>Usuarios registrados y roles de acceso al sistema.</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo electrónico</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role === "admin" ? "Administrador" : "Usuario estándar"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
