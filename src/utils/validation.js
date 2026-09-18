// Valida rápidamente la estructura de un correo electrónico.
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username) {
  return /^[a-zA-Z0-9_.-]{3,80}$/.test(username);
}
