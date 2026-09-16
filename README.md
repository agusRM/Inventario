# SuRepuesto | Palmares

Catálogo público e inventario de repuestos automotrices. La interfaz usa React/Vite y los mantenimientos se exponen mediante una API FastAPI conectada a MySQL.

## Estructura del proyecto

- `index.html` - Entrada del proyecto Vite.
- `package.json` - Dependencias y scripts.
- `vite.config.js` - Configuración básica de Vite.
- `src/main.jsx` - Punto de entrada de React.
- `src/App.jsx` - Componente principal que controla la autenticación.
- `src/styles.css` - Estilos globales.
- `src/components/AuthForm.jsx` - Formulario de login/registro.
- `src/components/WelcomeScreen.jsx` - Pantalla de bienvenida posterior al login.
- `src/components/MessageBar.jsx` - Mensajes de error/éxito.
- `src/hooks/useJqueryEffects.jsx` - Hook que aplica animaciones con jQuery.
- `src/constants/auth.js` - Modos de autenticación y estado inicial.
- `src/utils/validation.js` - Función de validación de email.
- `backend/main.py` - API FastAPI con búsqueda y CRUD.
- `backend/models.py` - Modelos MySQL de repuestos y catálogos relacionados.
- `backend/schemas.py` - Validaciones de entrada y salida de la API.
- `src/utils/api.js` - Cliente frontend para consumir la API local.
- `backend/.env.example` - Ejemplo de configuración de conexión.

## Dependencias

- `react`
- `react-dom`
- `jquery`
- `vite`
- `@vitejs/plugin-react`

## Instalación

En la carpeta del proyecto ejecuta:

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Luego abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Ejecutar la API Python

Requisitos: Python 3.11 o superior y un servidor MySQL con una base de datos llamada `surepuesto`.

Desde la carpeta `backend`:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --reload --port 8000
```

Si usas `uv`, ejecuta el backend desde `backend` con `.venv\\Scripts\\python.exe -m uvicorn main:app --reload --port 8000`.

Edita `backend/.env` con el usuario y contraseña de MySQL. La documentación interactiva queda disponible en `http://localhost:8000/docs`.
Configura también `SECRET_KEY` con una clave privada larga y `SESSION_EXPIRE_MINUTES` para controlar la duración de las sesiones. El frontend guarda el token en `sessionStorage` y lo elimina al cerrar sesión.

También puedes crear la base de datos y todas sus tablas ejecutando `backend/schema.sql` desde MySQL Workbench o con:

```bash
mysql -u root -p < backend/schema.sql
```

### Mantenimientos disponibles

- `POST /auth/register` y `POST /auth/login` - Registro e inicio de sesión de usuarios.
- `GET`, `PUT` y `DELETE /users` - Mantenimiento de usuarios (la contraseña nunca se devuelve).
- `POST`, `GET`, `PUT` y `DELETE /parts` - Repuestos, precio, stock, compatibilidad, ubicación y fotos múltiples.
- `POST`, `GET`, `PUT` y `DELETE /brands` - Marcas.
- `POST`, `GET`, `PUT` y `DELETE /models` - Modelos vinculados a una marca.
- `POST`, `GET`, `PUT` y `DELETE /warehouses` - Bodegas.
- `POST`, `GET`, `PUT` y `DELETE /shelves` - Anaqueles numerados por bodega.
- `POST`, `GET`, `PUT` y `DELETE /suppliers` - Proveedores.
- `GET /parts?search=Toyota` - Buscar repuestos.

Las operaciones de creación y edición requieren una sesión válida. Las operaciones de eliminación requieren una sesión con rol `admin`; los usuarios `user` reciben un error `403`.

El catálogo público y el inventario administrativo consultan los repuestos directamente desde la API. Debes tener FastAPI y MySQL encendidos para que carguen los datos.
Las fotos se seleccionan directamente desde el formulario de mantenimiento, se guardan en `backend/uploads` y se sirven mediante `/uploads/...`. Se aceptan máximo 8 archivos JPG, PNG, WEBP o GIF de hasta 5 MB cada uno, verificando también el formato real del archivo.

## Construir producción

```bash
npm run build
```

## Publicación recomendada

La configuración incluida está preparada para esta arquitectura:

- **Vercel:** frontend React/Vite.
- **Railway:** API FastAPI y servicio MySQL en el mismo proyecto.
- **GoDaddy:** DNS del dominio personalizado.

### 1. API y MySQL en Railway

1. Añade un servicio MySQL al proyecto de Railway.
2. Añade otro servicio desde este repositorio de GitHub. Railway usará
   `railway.json` y `backend/Dockerfile` para construir la API.
3. Configura estas variables en el servicio de la API:
   - `DATABASE_URL`: referencia la variable `MYSQL_URL` del servicio MySQL.
   - `SECRET_KEY`: una cadena aleatoria larga y privada.
   - `SESSION_EXPIRE_MINUTES`: `480`.
   - `CORS_ORIGINS`: URL de producción de Vercel, sin `/` al final.
   - `UPLOAD_DIR`: `/data/uploads`.
4. Crea un volumen persistente y móntalo en `/data` para conservar las fotos.
5. Genera un dominio público para la API y comprueba `https://TU-API/health`.

El código convierte automáticamente una URL `mysql://` de Railway al driver
`mysql+pymysql://` instalado en el proyecto.

### 2. Frontend en Vercel

1. Importa este repositorio y deja el directorio raíz en `.`.
2. Vercel detectará Vite; el comando es `npm run build` y la salida es `dist`.
3. Crea `VITE_API_URL` con el dominio público de Railway, sin `/` al final.
4. Despliega nuevamente después de guardar la variable.

`vercel.json` permite abrir directamente rutas como `/admin`, `/faq` y
`/privacidad` sin recibir un error 404.

### 3. Dominio de GoDaddy

Añade primero el dominio en **Vercel > Project > Settings > Domains**. Vercel
mostrará los registros DNS exactos que debes copiar en GoDaddy. Usa el dominio
principal y `www` para el frontend. Si quieres un subdominio para la API
(`api.tudominio.com`), configúralo en Railway y copia también su registro DNS.

Cuando el dominio definitivo esté activo, actualiza `CORS_ORIGINS` en Railway
para incluir tanto el dominio de Vercel como el dominio personalizado,
separados por coma, y vuelve a desplegar la API.

## Cómo funciona

- El componente `App.jsx` controla el estado global de autenticación y los datos del formulario.
- `AuthForm.jsx` muestra campos diferentes para login y registro.
- `MessageBar.jsx` muestra mensajes cortos de éxito o error.
- `useJqueryEffects.jsx` añade animaciones suaves usando jQuery para inputs y tarjetas.

## Buenas prácticas aplicadas

- Componentes separados por responsabilidad.
- Hook personalizado para efectos de jQuery.
- Validaciones básicas en el frontend.
- Estilos centralizados en `src/styles.css`.
