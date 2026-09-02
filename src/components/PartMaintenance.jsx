import { useEffect, useState } from "react";
import { api, mediaUrl } from "../utils/api.js";

const emptyForm = {
  name: "",
  part_number: "",
  brand_name: "",
  compatible_models: "",
  years: "",
  entry_date: new Date().toISOString().slice(0, 10),
  stock: 0,
  minimum_stock: 0,
  price: 0,
  shelf_id: "",
  supplier_id: "",
  photos: [],
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function PartMaintenance({ role }) {
  const [parts, setParts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [loadedParts, loadedBrands] = await Promise.all([api.getParts(), api.getBrands()]);
      setParts(loadedParts);
      setBrands(loadedBrands);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (form.photos.some((photo) => !ALLOWED_PHOTO_TYPES.includes(photo.type) || photo.size > MAX_PHOTO_SIZE)) {
        throw new Error("Cada foto debe ser JPG, PNG, WEBP o GIF y pesar máximo 5 MB.");
      }
      const brandName = form.brand_name.trim();
      let brand = brands.find((item) => item.name.toLowerCase() === brandName.toLowerCase());
      if (!brand) {
        brand = await api.createBrand({ name: brandName });
      }
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("part_number", form.part_number.trim());
      payload.append("brand_id", brand.id);
      payload.append("compatible_models", form.compatible_models.trim());
      payload.append("years", form.years.trim());
      payload.append("entry_date", form.entry_date);
      payload.append("stock", form.stock);
      payload.append("minimum_stock", form.minimum_stock);
      payload.append("price", form.price);
      if (form.shelf_id) payload.append("shelf_id", form.shelf_id);
      if (form.supplier_id) payload.append("supplier_id", form.supplier_id);
      form.photos.forEach((photo) => payload.append("photos", photo));
      if (editingId) {
        await api.updatePart(editingId, payload);
        setMessage("Repuesto actualizado correctamente.");
      } else {
        await api.createPart(payload);
        setMessage("Repuesto creado correctamente.");
      }
      resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const handleEdit = (part) => {
    setEditingId(part.id);
    setForm({
      name: part.name,
      part_number: part.part_number,
      brand_name: part.brand_name || "",
      compatible_models: part.compatible_models || "",
      years: part.years || "",
      entry_date: part.entry_date,
      stock: part.stock,
      minimum_stock: part.minimum_stock,
      price: part.price,
      shelf_id: part.shelf_id || "",
      supplier_id: part.supplier_id || "",
      photos: [],
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (part) => {
    if (!window.confirm(`¿Eliminar el repuesto ${part.name}?`)) return;
    try {
      await api.deletePart(part.id);
      setMessage("Repuesto eliminado correctamente.");
      if (editingId === part.id) resetForm();
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="inventory-card">
      <div className="inventory-header">
        <h2>Mantenimiento de repuestos</h2>
        <p>Crear, editar y eliminar repuestos almacenados en MySQL.</p>
      </div>

      <form className="maintenance-form" onSubmit={handleSubmit}>
        <div className="field"><label htmlFor="part-name">Nombre</label><input id="part-name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-number">Número de pieza</label><input id="part-number" required value={form.part_number} onChange={(event) => updateField("part_number", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-brand">Marca</label><input id="part-brand" required list="brand-options" value={form.brand_name} onChange={(event) => updateField("brand_name", event.target.value)} /><datalist id="brand-options">{brands.map((brand) => <option key={brand.id} value={brand.name} />)}</datalist></div>
        <div className="field"><label htmlFor="part-models">Modelos compatibles</label><input id="part-models" value={form.compatible_models} onChange={(event) => updateField("compatible_models", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-years">Años</label><input id="part-years" value={form.years} onChange={(event) => updateField("years", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-date">Fecha de ingreso</label><input id="part-date" type="date" required value={form.entry_date} onChange={(event) => updateField("entry_date", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-stock">Stock</label><input id="part-stock" type="number" min="0" required value={form.stock} onChange={(event) => updateField("stock", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-minimum">Stock mínimo</label><input id="part-minimum" type="number" min="0" required value={form.minimum_stock} onChange={(event) => updateField("minimum_stock", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-price">Precio</label><input id="part-price" type="number" min="0" step="0.01" required value={form.price} onChange={(event) => updateField("price", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-shelf">ID de anaquel</label><input id="part-shelf" type="number" min="1" value={form.shelf_id} onChange={(event) => updateField("shelf_id", event.target.value)} /></div>
        <div className="field"><label htmlFor="part-supplier">ID de proveedor</label><input id="part-supplier" type="number" min="1" value={form.supplier_id} onChange={(event) => updateField("supplier_id", event.target.value)} /></div>
        <div className="field maintenance-form-wide"><label htmlFor="part-photos">Fotos</label><input id="part-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => updateField("photos", Array.from(event.target.files || []))} /><small>Selecciona una o varias imágenes de máximo 5 MB cada una.</small></div>
        <div className="maintenance-actions">
          <button type="submit" className="btn-primary">{editingId ? "Guardar cambios" : "Crear repuesto"}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar edición</button>}
        </div>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead><tr><th>Repuesto</th><th>Marca</th><th>Pieza</th><th>Stock</th><th>Precio</th><th>Acciones</th></tr></thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id}>
                <td>{part.name}</td><td>{part.brand_name || "-"}</td><td>{part.part_number}</td><td>{part.stock}</td><td>{Number(part.price).toFixed(2)}</td>
                <td className="row-actions"><button type="button" className="btn-secondary" onClick={() => handleEdit(part)}>Editar</button>{role === "admin" && <button type="button" className="btn-danger" onClick={() => handleDelete(part)}>Eliminar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PartMaintenance;
