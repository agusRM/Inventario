// Modos disponibles para la vista de autenticación.
export const authModes = {
  LOGIN: "login",
  REGISTER: "register",
};

// Estado inicial del formulario compartido entre login y registro.
export const initialFormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};
