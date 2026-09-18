// Componente que muestra el formulario de autenticación.
// Reutiliza los mismos campos para login y registro según el modo actual.
function AuthForm({ mode, formData, onFieldChange, onSubmit }) {
  const isLogin = mode === "login";

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(event) => onFieldChange("username", event.target.value)}
          placeholder="Nombre de usuario"
          maxLength={80}
          autoComplete="username"
        />
      </div>

      {/* Muestra campo de correo solo en modo registro */}
      {!isLogin && (
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          minLength={isLogin ? undefined : 8}
          value={formData.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          placeholder="********"
          maxLength={128}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>

      {/* Muestra campo de confirmación solo en modo registro */}
      {!isLogin && (
        <div className="field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(event) => onFieldChange("confirmPassword", event.target.value)}
            placeholder="********"
            maxLength={128}
            autoComplete="new-password"
          />
        </div>
      )}

      <button
        type="submit"
        className={isLogin ? "btn-primary" : "btn-secondary"}
      >
        {isLogin ? "Entrar" : "Registrarse"}
      </button>
    </form>
  );
}

export default AuthForm;
