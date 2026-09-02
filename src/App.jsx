import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import CatalogPage from "./components/CatalogPage.jsx";
import MessageBar from "./components/MessageBar.jsx";
import useJqueryEffects from "./hooks/useJqueryEffects.jsx";
import { authModes, initialFormState } from "./constants/auth.js";
import { isValidEmail } from "./utils/validation.js";
import { api } from "./utils/api.js";
import PublicInfoPage, { NotFoundPage, ThankYouPage } from "./components/PublicInfoPage.jsx";
import PrivacyPage from "./components/PrivacyPage.jsx";

function App() {
  // Estado de la vista actual: login o registro.
  const [mode, setMode] = useState(authModes.LOGIN);
  // Estado de autenticación para mostrar la vista de bienvenida.
  const [authenticated, setAuthenticated] = useState(false);
  // Mantiene el catálogo público como la vista inicial.
  const [showCatalog, setShowCatalog] = useState(true);
  // Nombre visible del usuario autenticado.
  const [displayName, setDisplayName] = useState("");
  // Rol del usuario autenticado: admin o user.
  const [userRole, setUserRole] = useState(null);
  // Datos del formulario que se comparten entre login y registro.
  const [formData, setFormData] = useState(initialFormState);
  // Mensaje de feedback que muestra errores o éxitos.
  const [message, setMessage] = useState(null);
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const metadata = {
      "/": ["SuRepuesto | Palmares - Catálogo de repuestos", "Encuentra repuestos automotrices nuevos y de segunda en SuRepuesto Palmares."],
      "/faq": ["Preguntas frecuentes | SuRepuesto", "Resuelve tus dudas sobre repuestos, precios, disponibilidad y atención en Palmares."],
      "/casos-de-exito": ["Casos de éxito | SuRepuesto", "Conoce cómo nuestros clientes encontraron la pieza correcta para su vehículo."],
      "/gracias": ["Gracias por registrarte | SuRepuesto", "Tu cuenta de SuRepuesto fue creada correctamente."],
      "/privacidad": ["Política de privacidad | SuRepuesto", "Conoce cómo SuRepuesto protege y utiliza tus datos personales."],
      "/admin": ["Acceso administrativo | SuRepuesto", "Ingresa al panel de inventario de SuRepuesto."],
    };
    const [title, description] = metadata[route] || ["Página no encontrada | SuRepuesto", "La página que buscas no está disponible."];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [route]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
  };

  // Hook personalizado que aplica efectos jQuery cuando cambian la vista o autenticación.
  useJqueryEffects({ mode, authenticated });

  // Actualiza un campo del formulario dinámicamente.
  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setMessage(null);
  };

  const toggleMode = () => {
    setMode((current) =>
      current === authModes.LOGIN ? authModes.REGISTER : authModes.LOGIN,
    );
    resetForm();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // Maneja el envío del formulario de login.
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      showMessage("error", "Por favor completa usuario y contraseña.");
      return;
    }

    try {
      const session = await api.login({ username: formData.username, password: formData.password });
      api.saveSession(session);
      setDisplayName(session.user.username);
      setUserRole(session.user.role);
      setAuthenticated(true);
    } catch (error) {
      showMessage("error", error.message);
    }
  };

  // Maneja el envío del formulario de registro.
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!isValidEmail(formData.email)) {
      showMessage("error", "Ingresa un correo electrónico válido.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showMessage("error", "Las contraseñas no coinciden.");
      return;
    }
    try {
      await api.register({ username: formData.username, email: formData.email, password: formData.password });
      showMessage("success", "Cuenta creada. Ya puedes iniciar sesión.");
      navigate("/gracias");
      setFormData(initialFormState);
    } catch (error) {
      showMessage("error", error.message);
    }
  };

  // Cierra la sesión y vuelve al modo de login.
  const handleLogout = () => {
    api.clearSession();
    setAuthenticated(false);
    setUserRole(null);
    setDisplayName("");
    setMode(authModes.LOGIN);
    resetForm();
    showMessage("success", "Has cerrado sesión correctamente.");
  };

  const handleAdminLogin = () => {
    navigate("/admin");
    setShowCatalog(false);
    setMessage(null);
  };

  const showCatalogPage = () => {
    navigate("/");
    setShowCatalog(true);
    setMode(authModes.LOGIN);
  };

  const showLoginPage = () => {
    navigate("/admin");
    setShowCatalog(false);
    setMode(authModes.LOGIN);
  };

  return (
    <main className="app-shell">
      {authenticated ? (
        <WelcomeScreen
          username={displayName}
          role={userRole}
          onLogout={handleLogout}
        />
      ) : route === "/faq" ? (
        <PublicInfoPage type="faq" onCatalog={showCatalogPage} />
      ) : route === "/casos-de-exito" ? (
        <PublicInfoPage type="cases" onCatalog={showCatalogPage} />
      ) : route === "/gracias" ? (
        <ThankYouPage onCatalog={showCatalogPage} onLogin={showLoginPage} />
      ) : route === "/privacidad" ? (
        <PrivacyPage onCatalog={showCatalogPage} />
      ) : route !== "/" && route !== "/admin" ? (
        <NotFoundPage onCatalog={showCatalogPage} />
      ) : showCatalog ? (
        <CatalogPage onAdminLogin={handleAdminLogin} onNavigate={navigate} />
      ) : (
        <section className="card-wrapper">
          <div className="branding-bar">
            <img className="brand-logo" src="/logo-surepuesto.jpg" alt="Logo de SuRepuesto" />
            <div>
              <h1>{mode === authModes.LOGIN ? "Ingreso al panel" : "Registro"}</h1>
              <p>
                {mode === authModes.LOGIN
                  ? "Accede al inventario de repuestos para vehículos."
                  : "Crea una cuenta para administrar los repuestos."}
              </p>
            </div>
          </div>

          <div className="auth-card">
            <button type="button" className="catalog-back-button" onClick={() => setShowCatalog(true)}>
              Volver al catálogo público
            </button>
            <div className="auth-switch">
              <span>
                {mode === authModes.LOGIN
                  ? "¿No tienes cuenta?"
                  : "¿Ya tienes cuenta?"}
              </span>
              <button type="button" className="link-button" onClick={toggleMode}>
                {mode === authModes.LOGIN ? "Registrarse" : "Iniciar sesión"}
              </button>
            </div>

            <AuthForm
              mode={mode}
              formData={formData}
              onFieldChange={updateField}
              onSubmit={mode === authModes.LOGIN ? handleLogin : handleRegister}
            />

            <MessageBar message={message} />
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
