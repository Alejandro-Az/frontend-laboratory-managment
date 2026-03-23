# Laboratory Management — Frontend

Panel administrativo para gestión de laboratorio. Consume la API REST del backend Laravel.

---

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Axios

---

## Requisitos

- Node.js 20+
- Backend corriendo en `http://localhost:8000`

---

## Instalación (desarrollo)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd laboratory-managment-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y apuntar VITE_API_BASE_URL al backend

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Credenciales de prueba

| Email | Password | Rol |
|---|---|---|
| admin@laboratory.local | password | admin |
| analyst@laboratory.local | password | analyst |

---

## Build de producción

```bash
npm run build
# Archivos en /dist
```

---

## Despliegue con Docker

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API del backend | `http://localhost:8000/api/v1` |
| `FRONTEND_PORT` | Puerto expuesto del contenedor | `3000` |

### Usando docker-compose

```bash
# Copiar y editar variables
cp .env.example .env

# Construir e iniciar
docker-compose up -d --build

# La app estará disponible en http://localhost:3000
```

### Construir imagen manualmente

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.tu-dominio.com/api/v1 \
  -t lab-frontend .

docker run -p 3000:80 lab-frontend
```

> **Nota importante:** Las variables `VITE_*` se embeben en el bundle estático durante el build.
> No se pueden cambiar en runtime. Si cambiás la URL del backend, hay que reconstruir la imagen.

---

## Estructura del proyecto

```
src/
  api/           # Cliente HTTP (axios) y funciones por módulo
  components/    # Componentes reutilizables (Badge, Modal, Spinner, etc.)
  context/       # AuthContext — manejo de sesión y roles
  layouts/       # Sidebar, Topbar, MainLayout
  pages/         # Páginas por ruta
  types/         # Tipos TypeScript derivados de la API
  utils/         # Helpers de formato y errores
```

---

## Rutas

| Ruta | Descripción | Roles |
|---|---|---|
| `/login` | Pantalla de inicio de sesión | — |
| `/dashboard` | Métricas y actividad reciente | admin, analyst |
| `/samples` | Lista de muestras con filtros | admin, analyst |
| `/samples/:id` | Detalle, resultados y eventos | admin, analyst |
| `/projects` | Lista de proyectos | admin, analyst |
| `/clients` | Lista de clientes | admin, analyst |
| `/settings` | Perfil, preferencias y seguridad | admin, analyst |

---

## Roles y permisos

| Acción | admin | analyst |
|---|:---:|:---:|
| Ver clientes, proyectos, muestras | ✓ | ✓ |
| Crear / editar / eliminar recursos | ✓ | — |
| Cambiar status de muestra | ✓ | ✓ |
| Cambiar priority de muestra | ✓ | — |
| Agregar resultado a muestra | ✓ | ✓ |
| Ver dashboard | ✓ | ✓ |
| Gestionar perfil propio | ✓ | ✓ |
