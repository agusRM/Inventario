const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const mediaUrl = (path) => (path?.startsWith("http") ? path : `${API_URL}${path}`);

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = sessionStorage.getItem("access_token");
  const authorization = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_URL}${path}`, {
    headers: isFormData ? { ...authorization, ...(options.headers || {}) } : { "Content-Type": "application/json", ...authorization, ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || "No se pudo completar la solicitud");
  }
  return data;
}

export const api = {
  getParts: (search = "") => request(`/parts${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createPart: (part) => request("/parts", { method: "POST", body: part }),
  updatePart: (id, part) => request(`/parts/${id}`, { method: "PUT", body: part }),
  deletePart: (id) => request(`/parts/${id}`, { method: "DELETE" }),
  saveSession: (auth) => sessionStorage.setItem("access_token", auth.access_token),
  clearSession: () => sessionStorage.removeItem("access_token"),
  getUsers: () => request("/users"),
  login: (credentials) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  }),
  register: (user) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  }),
};
