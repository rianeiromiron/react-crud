# Notas de aprendizaje (React + TypeScript)

Borrador armado a partir de mis respuestas. Pendiente: reescribir lo que no me suene a mí.

## Bloque 0: Arranque

- **CORS:** el navegador (no el servidor) bloquea la respuesta si el servidor no dice que ese origen puede leerla. Un origen es protocolo + dominio + puerto, por eso `localhost:5173` y `localhost:8082` son orígenes distintos. La API en Go lo permite con la cabecera `Access-Control-Allow-Origin`.
- **`!` en `document.getElementById('root')!`:** le dice a TypeScript que ese valor no es null. No comprueba nada al ejecutar; si fuera null, fallaría ahí.
- **Flujo de arranque:** `index.html` → `main.tsx` (`createRoot`) → `App.tsx`.

## Bloque 1: La lista

- **Props:** datos que un componente recibe de su padre (`clients` en `ClientTable`).
- **`useState`:** memoria del componente. Al cambiarla con su setter, React vuelve a dibujar.
- **`useEffect(fn, [])`:** corre `fn` después del primer dibujo. Sin el `[]` correría después de cada dibujo, y como el efecto cambia el estado, haría un ciclo infinito de peticiones (el arreglo que devuelve `res.json()` es nuevo cada vez, por eso React lo ve como cambio).
- **`key` en listas:** debe identificar al elemento (`client.id`), no su posición. Con el índice, al agregar, borrar o reordenar, React puede asociar una fila con el cliente equivocado.
- **`fetch` y los errores:** `fetch` solo falla si no hay red. Un 404 o 500 hay que detectarlo con `res.ok`.
- **StrictMode:** en desarrollo monta dos veces para detectar problemas, por eso el `GET` aparece duplicado.

## Bloque 2: Formularios y CRUD

- **Componente controlado:** el `value` del input viene del estado y `onChange` lo actualiza. Sin `onChange`, el campo queda de solo lectura. Lo opuesto es el no controlado, donde el DOM guarda el valor y se lee con `ref`.
- **Actualizar estado con función:** `setX(current => ...)` cuando el nuevo valor depende del anterior, porque `current` es siempre el último valor y no una foto vieja.
- **`onClick={() => f(x)}` vs `onClick={f(x)}`:** `onClick` espera una función. Sin la flecha, `f(x)` se ejecuta al dibujar.
- **Subir el estado (lifting state up):** el estado vive en `App`, y los hijos reciben datos y funciones por props (`onEdit`, `onDelete`).
- **`e.preventDefault()`** en el submit: evita que el navegador recargue la página.
- **Validar en cliente y en servidor:** la del cliente es comodidad (respuesta rápida, ahorra una petición). La del servidor es la que protege, porque la del cliente se puede saltar con curl.
- **`key` en el formulario:** al cambiar de cliente, un `key` distinto hace que React cree un formulario nuevo. Sin él, `useState` mantendría los valores del cliente anterior.

## Bloque 3: Pantallas y estilo (en curso)

### Dependencias nuevas (aprobadas)

Instaladas con `npm install react-router-dom tailwindcss @tailwindcss/vite` (versiones: react-router-dom 7.x, tailwindcss 4.x).

- **react-router-dom:** navegación entre pantallas con su propia URL (`/`, `/clientes/nuevo`, `/clientes/:id`) sin recargar la página. React por sí solo dibuja componentes pero no sabe nada de URLs.
- **tailwindcss + @tailwindcss/vite:** estilos con clases de utilidad escritas directamente en el JSX (`className="p-4 bg-white"`). En mis otros proyectos lo usaba por CDN; aquí se instala como paquete y Vite genera solo el CSS que realmente uso.

### Cambios de configuración

- `vite.config.ts`: se agregó `tailwindcss()` a la lista de `plugins`.
- `src/index.css`: ahora solo contiene `@import "tailwindcss";`. Se quitaron los estilos manuales anteriores.
- Hay que reiniciar `npm run dev` después de cambiar `vite.config.ts`, porque Vite lee esa configuración solo al arrancar.

### Router (paso 1 del Bloque 3)

Estructura nueva en `frontend/src/`:

```
main.tsx                    BrowserRouter envuelve la app
App.tsx                     cabecera + <Routes> con las 4 rutas
api/clients.ts              las 5 llamadas a la API (list, get, create, update, delete)
pages/ClientListPage.tsx    ruta /                      lista + borrar
pages/ClientFormPage.tsx    rutas /clientes/nuevo y /clientes/:id/editar
pages/ClientDetailPage.tsx  ruta /clientes/:id
```

- **`BrowserRouter`:** da a toda la app acceso a la URL del navegador.
- **`Routes` / `Route`:** "si la URL es esta, dibuja este componente". `:id` es un parámetro y se lee con `useParams()`.
- **`Link`:** cambia la URL sin recargar la página (un `<a>` normal la recargaría y se perdería el estado).
- **`useNavigate`:** cambia de ruta desde código, por ejemplo al guardar un formulario (`navigate('/')`).
- **Cada página pide sus datos:** ya no hay un estado global en `App`. Con pantallas separadas, la lista pide la lista y el formulario de edición pide un solo cliente por su `id`.
- **Un formulario, dos rutas:** `ClientFormPage` mira si hay `id` en la URL. Sin `id` crea; con `id` carga el cliente y edita.
- **`api/clients.ts`:** el helper `request` convierte cualquier respuesta no exitosa en una excepción con el mensaje de la API. Así las páginas solo hacen `try/catch`. Esto era del Bloque 4 y se adelantó para no repetir `fetch` en cada página.

### Estilo con Tailwind (paso 2 del Bloque 3)

- **Clases de utilidad:** cada clase hace una sola cosa y se escribe en `className`. `px-3 py-1.5` = relleno horizontal y vertical, `bg-blue-600` = fondo, `rounded` = esquinas, `hover:bg-blue-700` = estilo solo al pasar el cursor. Vite lee los archivos y genera solo el CSS de las clases que uso.
- **`src/ui.ts`:** guarda los tres estilos de botón (`btnPrimary`, `btnSecondary`, `btnDanger`) para no repetir cadenas largas. Se usan con `className={btnPrimary}`, tanto en `<button>` como en `<Link>`.
- **Tailwind quita los estilos por defecto** del navegador (títulos, botones, tablas). Por eso, sin clases, todo se ve como texto plano.
- **Contenedor:** `mx-auto max-w-4xl p-6` centra el contenido con un ancho máximo; `min-h-screen bg-gray-50` pinta el fondo de toda la ventana.

## Bloque 4: Pruebas (en curso)

### Dependencias nuevas (aprobadas, solo de desarrollo)

Instaladas con `npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @testing-library/dom`.

- **vitest:** ejecuta las pruebas. Comparte la configuración de Vite, así que no hay que configurar otro compilador.
- **jsdom:** navegador simulado en memoria. Permite dibujar componentes en una prueba sin abrir Chrome.
- **@testing-library/react:** dibuja un componente en la prueba y permite buscar elementos como los vería un usuario (por texto, por rol), no por clases CSS.
- **@testing-library/user-event:** simula clics y escritura de forma realista.
- **@testing-library/jest-dom:** comprobaciones legibles como `toBeInTheDocument()`.
- **@testing-library/dom:** la exige `@testing-library/react` como dependencia hermana (no estaba en mi lista original).

### Configuración

- `vite.config.ts`: ahora importa `defineConfig` desde `vitest/config` y tiene un bloque `test` con `environment: 'jsdom'` y `setupFiles`.
- `src/test/setup.ts`: se ejecuta antes de cada archivo de pruebas. Solo registra las comprobaciones de jest-dom.
- `package.json`: script nuevo `"test": "vitest run"`.

### Las 3 pruebas (`npm test`)

| Archivo | Qué comprueba |
|---|---|
| `src/pages/ClientListPage.test.tsx` | muestra los clientes que devuelve la API |
| `src/pages/ClientListPage.test.tsx` | muestra el mensaje de error si la API falla |
| `src/ClientForm.test.tsx` | al guardar, `onSave` recibe los datos escritos |

- **Patrón:** preparar (`render`), actuar (`user.type`, `user.click`), comprobar (`expect`).
- **`vi.mock('../api/clients')`:** reemplaza las funciones de la API por falsas. Las pruebas no llaman a Go ni necesitan Postgres. Cada prueba decide qué devuelve con `mockResolvedValue` o `mockRejectedValue`.
- **`MemoryRouter`:** router sin navegador real. Los componentes con `<Link>` lo necesitan para dibujarse en una prueba.
- **`findByText` vs `getByText`:** `find` espera (es asíncrono) a que aparezca el texto, `get` lo busca ya. Los datos llegan después de una promesa, así que se usa `find`.
- **Buscar como un usuario:** `getByLabelText('Nombre')` y `getByRole('button', { name: 'Guardar' })`, no por clases CSS. Si cambio el estilo, la prueba sigue válida.
- **`afterEach(cleanup)`** en `src/test/setup.ts`: sin los globals de Vitest, Testing Library no limpia el DOM entre pruebas por sí sola.
- **Comprobé que las pruebas pueden fallar:** rompí a propósito `handleChange` del formulario y la prueba del formulario se puso en rojo.

## Bloque 5: Entrega (Docker)

### Decisiones tomadas

1. **El frontend llama a `/api/clients` (ruta relativa), no a `http://localhost:8082`.** NGINX (en Docker) y el proxy de Vite (en desarrollo) reenvían `/api` a la API en Go. El navegador ve un solo origen, así que ya no hace falta CORS. El middleware de CORS sigue en Go pero no se usa en este flujo.
2. **Puertos:** frontend en `localhost:3000`, base de datos publicada en `5433` (solo para desarrollo), API sin puerto publicado (solo visible dentro de la red de Docker). El 5432, 8080 y 8081 ya estaban ocupados por otros contenedores míos.
3. **Credenciales en `.env`** (ignorado por Git) con `.env.example` como plantilla. Sin contraseñas escritas en el repositorio.

### Archivos

- `backend/Dockerfile`: build en dos etapas. La primera compila el binario con `golang:1.26-alpine`; la segunda solo copia el binario a `alpine`. La imagen final es pequeña y no lleva el compilador.
- `frontend/Dockerfile`: build en dos etapas. Node compila con `npm run build`; NGINX sirve solo la carpeta `dist`.
- `frontend/nginx.conf`: `location /api/` reenvía a `http://api:8082` (el nombre del servicio en compose funciona como nombre de host). `location /` con `try_files $uri /index.html` hace que al recargar `/clientes/nuevo` NGINX devuelva `index.html` y React Router resuelva la ruta; sin eso daría 404.
- `docker-compose.yml`: servicios `db`, `api` y `frontend`. `depends_on` con `condition: service_healthy` hace que la API espere a que Postgres responda `pg_isready`.
- `.dockerignore`: evita copiar `node_modules`, `dist` y `.env` a las imágenes.
- `README.md` (en inglés): qué es, arquitectura, cómo correrlo y la sección honesta "What I learned / level". Incluye una captura en `docs/screenshot.png` (con datos inventados, sin datos personales reales).

### Verificado

`docker compose up -d --build` levantó los tres servicios. Se probó a través de NGINX en `:3000`: la página (200), la ruta `/clientes/nuevo` (200), listar, crear (201) y validación (400). Los datos previos siguieron en el volumen `pgdata`.

Ojo: `docker compose down -v` borra el volumen y con él todos los clientes. Usar solo `docker compose down`.

---

# Arquitectura (resumen de todo lo hecho)

## Vista general

```
Navegador ──► NGINX :3000 ──► archivos estáticos de React (dist/)
                 │
                 └─ /api/* ──► API en Go :8082 ──► PostgreSQL :5432
```

En desarrollo: Vite `:5173` (con proxy de `/api` a Go `:8082`) y Postgres publicado en `:5433`.

## Backend (`backend/`, Go, sin arquitectura por capas)

| Archivo | Responsabilidad |
|---|---|
| `main.go` | variables de entorno, conexión a Postgres, rutas, middleware de CORS |
| `handlers.go` | los 5 endpoints; traduce errores a códigos HTTP (400, 404, 500) |
| `store.go` | todas las consultas SQL (`pgx`); crea la tabla `clients` al arrancar |
| `client.go` | struct `Client`, `ClientInput` y la validación (nombre y email) |

Rutas: `GET/POST /api/clients`, `GET/PUT/DELETE /api/clients/{id}`. Los errores salen como `{"error": "mensaje"}`.

## Frontend (`frontend/src/`)

```
main.tsx                      BrowserRouter envuelve App
App.tsx                       cabecera + rutas
api/clients.ts                request() y las 5 funciones de la API
pages/ClientListPage.tsx      /                      lista + borrar
pages/ClientFormPage.tsx      /clientes/nuevo, /clientes/:id/editar
pages/ClientDetailPage.tsx    /clientes/:id
ClientTable.tsx               tabla (recibe clients y onDelete por props)
ClientForm.tsx                formulario controlado, valida y llama a onSave
types.ts                      Client y ClientInput
ui.ts                         clases de Tailwind de los botones
test/setup.ts                 configuración de las pruebas
*.test.tsx                    las 3 pruebas
```

Flujo de datos: cada página es dueña de su estado, pide datos con las funciones de `api/clients.ts` y se los pasa por props a componentes que solo dibujan (`ClientTable`, `ClientForm`).

## Historial de bloques

| Bloque | Qué quedó hecho |
|---|---|
| 0 | Backend en Go + Postgres; proyecto Vite; CORS verificado desde el navegador |
| 1 | Lista: tipos, `ClientTable`, `useState`, `useEffect`, `key`, estados de carga y error |
| 2 | Formulario controlado, crear, editar y borrar con confirmación, validación cliente y servidor |
| 3 | React Router (4 rutas), cliente de API separado, estilo con Tailwind |
| 4 | Vitest + Testing Library: 3 pruebas con la API mockeada |
| 5 | Dockerfiles, docker-compose, NGINX, `.env`, README en inglés |

## Dependencias añadidas (todas aprobadas)

- Producción: `react-router-dom`, `tailwindcss`, `@tailwindcss/vite` (ésta en realidad es de build).
- Desarrollo: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@testing-library/dom`.
- Backend: `github.com/jackc/pgx/v5`.

## Problemas encontrados y su causa (para la entrevista)

- **Puerto 5432 y 8080 ocupados** por otros contenedores: se movieron a 5433 y 8082.
- **Página en blanco tras reescribir varios archivos:** el vigilante de archivos de Vite se quedó con una copia vacía; se arregla reiniciando `npm run dev`.
- **Tildes rotas ("G�mez"):** la terminal de Windows envió bytes que no eran UTF-8; Go los reemplazó al decodificar el JSON. No era un error de React.
- **Consola del navegador bloqueando el pegado:** protección de Chrome contra "self-XSS" (`allow pasting`).
