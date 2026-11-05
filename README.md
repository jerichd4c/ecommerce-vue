# E-commerce Vue

Tienda en línea hecha con Vue 3 para la materia Manejo de Frameworks (URU). Es solo frontend: los productos y el inicio de sesión vienen de la API pública [DummyJSON](https://dummyjson.com).

## Requisitos

- Node.js 22.18 o superior (o 24.12 o superior)
- npm
- Git

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/jerichd4c/ecommerce-vue.git
   cd ecommerce-vue
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   En PowerShell: `Copy-Item .env.example .env`

4. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación queda en http://localhost:5173

## Comandos

| Comando             | Para qué sirve                               |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                       |
| `npm run build`     | Genera la versión de producción en `dist/`   |
| `npm run preview`   | Sirve la versión de producción para probarla |
| `npm run lint`      | Revisa y corrige el estilo del código        |
| `npm run format`    | Formatea el código con Prettier              |
| `npm run test:unit` | Ejecuta las pruebas                          |

## Tecnologías

- Vue 3 (Composition API con `<script setup>`)
- Vite
- Vue Router
- Pinia
- ESLint, oxlint y Prettier
- Vitest

## Estructura del proyecto

```
src/
  modules/        cada funcionalidad en su propia carpeta
    catalog/      lista de productos, scroll infinito, búsqueda y filtros
    product/      vista de detalle de un producto
    cart/         carrito de compras
    auth/         inicio y cierre de sesión, protección de rutas
    checkout/     formulario de compra simulado
  shared/         piezas que usan todos los módulos
    components/   BaseButton, BaseInput, LazyImage, AppHeader
    views/        página 404
    utils/        funciones de ayuda (formatPrice, setPageTitle)
    http.js       cliente para llamar a la API
  router/         une las rutas de todos los módulos
  assets/         estilos globales
```

Cada módulo tiene la misma forma:

- `routes.js`: las rutas del módulo
- `store.js`: su estado con Pinia (si lo necesita)
- `api.js`: las llamadas a la API del módulo (si las necesita)
- `views/`: las páginas
- `components/`: componentes que solo usa ese módulo
- `composables/`: lógica reutilizable con reactividad (por ejemplo, `useInfiniteScroll`)
- `__tests__/`: sus pruebas

Regla principal: **cada quien trabaja dentro de su módulo**. Si necesitas cambiar algo en `shared/` o en `router/`, avísalo al equipo antes.

## Equipo y responsabilidades

### Sebastián Cohen (jerichd4c) - Líder técnico

Módulo: **catalog** (terminado, PR #2)

- Lista de productos con scroll infinito (`IntersectionObserver`)
- Carga progresiva de imágenes usando `LazyImage`
- Búsqueda de productos con espera entre teclas (debounce)
- Filtro por categoría
- Estados de cargando, sin resultados y error

Además:

- Mantener `shared/` y `router/`
- Revisar y aprobar los Pull Requests hacia `develop`
- Pasar `develop` a `main` cuando una fase esté estable
- Mantener el `README.md` y el `CONTRIBUTING.md`
- Revisión final de accesibilidad y adaptación a pantallas

### Jesús Quintero (JesusQG)

Módulos: **auth** y **checkout** (todo terminado)

- Store de sesión: login con `POST /auth/login` de DummyJSON, cierre de sesión y sesión guardada en `localStorage` (PR #5)
- Página de inicio de sesión con validación de campos y redirección segura (PR #11, issue #8)
- Checkout: formulario de compra simulado con validación, resumen del carrito y pantalla de confirmación (PR #12, issue #9)
- Correcciones del checkout: formulario en celular y compra cancelada si se sale durante el procesamiento (PR #13)

Además:

- Revisar los Pull Requests de Sebastián

### Gianpaolo Strada (GianpaoloStrad)

Módulos: **product** y **cart**, y el **header** (todo terminado)

- Store del carrito con `addItem`, `removeItem`, `setQty` y `clear`, guardado en `localStorage` (PR #3)
- Vista del carrito: lista de productos, cambiar cantidades, quitar productos y total actualizado (PR #4)
- Vista de detalle: producto con `GET /products/:id`, estados de carga, error y "no encontrado" (PR #6)
- Header: contador del carrito y "Iniciar sesión" o "Cerrar sesión" según el estado (PR #7)

Además:

- Revisar los Pull Requests de Sebastián mientras Jesús no esté disponible

## Contratos entre módulos

Estas son las funciones que un módulo puede usar de otro. Ya están implementadas.

**Store del carrito** (`modules/cart/store.js`), responsable: Gianpaolo

| Nombre             | Qué hace                                                    |
| ------------------ | ----------------------------------------------------------- |
| `items`            | Lista de `{ product, qty }`                                 |
| `count`            | Cantidad total de productos                                 |
| `total`            | Precio total                                                |
| `addItem(product)` | Agrega un producto o suma 1 si ya estaba                    |
| `removeItem(id)`   | Quita un producto                                           |
| `setQty(id, qty)`  | Cambia la cantidad                                          |
| `clear()`          | Vacía el carrito (lo usa el checkout al terminar la compra) |

**Store de sesión** (`modules/auth/store.js`), responsable: Jesús

| Nombre               | Qué hace                                   |
| -------------------- | ------------------------------------------ |
| `token`              | Token de la sesión, o `null`               |
| `user`               | Datos del usuario, o `null`                |
| `isAuthenticated`    | `true` si hay sesión                       |
| `login(credentials)` | Inicia sesión con `{ username, password }` |
| `logout()`           | Cierra la sesión                           |

Si el login falla, `login()` lanza un error con el mensaje de la API (por ejemplo, "Invalid credentials").

Si necesitas cambiar un contrato, coméntalo primero con el responsable.

## API (DummyJSON)

| Uso                        | Endpoint                        |
| -------------------------- | ------------------------------- |
| Productos paginados        | `GET /products?limit=20&skip=0` |
| Buscar                     | `GET /products/search?q=texto`  |
| Lista de categorías        | `GET /products/categories`      |
| Productos de una categoría | `GET /products/category/{slug}` |
| Un producto                | `GET /products/{id}`            |
| Iniciar sesión             | `POST /auth/login`              |

Para llamar a la API se usa siempre `http()` de `shared/http.js`, nunca `fetch` directamente.

Usuario de prueba para iniciar sesión: `emilys` / `emilyspass`

El login responde con el token en el campo `accessToken` (no `token`).

## Cómo trabajamos con Git

Ramas:

- `main`: versión estable. Nadie trabaja aquí directamente.
- `develop`: donde se junta el trabajo de todos.
- `feature/<modulo>-<tarea>`: una rama por tarea. Ejemplo: `feature/cart-store`

Pasos para cada tarea:

1. Actualizar `develop`:

   ```bash
   git switch develop
   git pull
   ```

2. Crear la rama de la tarea:

   ```bash
   git switch -c feature/cart-store
   ```

3. Trabajar y hacer commits pequeños.

4. Antes de subir, comprobar que todo pasa:

   ```bash
   npm run format
   npm run lint
   npx vitest run --sequence.shuffle
   npm run build
   ```

   `--sequence.shuffle` corre las pruebas en orden aleatorio. Así se detectan pruebas que dependen unas de otras (por ejemplo, por datos que quedan en `localStorage`).

5. Subir la rama:

   ```bash
   git push -u origin feature/cart-store
   ```

6. Abrir un Pull Request en GitHub hacia `develop`.

7. Esperar una aprobación y luego hacer merge.

8. Borrar la rama cuando ya esté unida, en GitHub y en tu computadora (`git branch -d feature/cart-store`).

### Mensajes de commit

Formato: `tipo: descripción corta en minúscula`

| Tipo       | Cuándo                                     |
| ---------- | ------------------------------------------ |
| `feat`     | Algo nuevo                                 |
| `fix`      | Corrección de un error                     |
| `style`    | Cambios visuales o de CSS                  |
| `refactor` | Reorganizar código sin cambiar lo que hace |
| `docs`     | Documentación                              |
| `test`     | Pruebas                                    |
| `chore`    | Configuración o tareas de mantenimiento    |

Ejemplos:

```
feat: agregar scroll infinito al catálogo
fix: corregir total del carrito al quitar productos
docs: completar instrucciones del readme
```

### Pull Requests

- Un Pull Request por tarea, no uno gigante por módulo.
- En la descripción, explicar qué se hizo y cómo probarlo.
- Si el PR resuelve un issue, escribir `Closes #N` en la descripción para que se cierre solo al unirse.
- Toda rama necesita **una aprobación** antes de unirse a `develop`.
- Quién revisa:
  - Los PR de Gianpaolo y de Jesús los revisa Sebastián.
  - Los PR de Sebastián los revisa Jesús, o Gianpaolo mientras Jesús no esté disponible.
- Nadie aprueba un PR que tenga commits propios.
- Si hay conflictos, los resuelve quien abrió el PR.

## Reglas de código

- Componentes con `<script setup>`.
- Nombres de componentes en PascalCase: `ProductCard.vue`.
- Las vistas terminan en `View`: `CartView.vue`.
- Usar `BaseButton` y `BaseInput` en lugar de crear botones o campos nuevos.
- Todas las imágenes de productos con `LazyImage` y con texto alternativo (`alt`).
- Todo campo de formulario con su etiqueta (`label`).
- Toda vista que cargue datos debe mostrar los estados de cargando, vacío y error.
- Usar las variables de color de `src/assets/main.css` en lugar de colores fijos.
- Probar cada pantalla en celular y en computadora antes de abrir el PR.

## Fases

1. **Sprint 0** (terminado): estructura del proyecto, rutas, componentes base y repositorio.
2. **Sprint 1** (terminado): catálogo, detalle, carrito, header, inicio de sesión y checkout. Todos los requisitos del enunciado están cumplidos.
3. **Sprint 2** (terminado): títulos por página, foco al cambiar de página y revisión final de accesibilidad y adaptación a pantallas.
4. **Cierre**: pasar `develop` a `main` y ensayo de la defensa.

## Accesibilidad y adaptación a pantallas

Revisión final hecha sobre todas las pantallas (catálogo, detalle, carrito vacío y con productos, login con errores, checkout con errores, confirmación y 404):

- Cada página tiene su propio título en la pestaña (por ejemplo, "Carrito | Ecommerce Vue"). En el detalle, el título es el nombre del producto.
- Al cambiar de página, el foco pasa al contenido principal para que el teclado y el lector de pantalla sigan desde ahí.
- Enlace "Saltar al contenido" al inicio de cada página.
- Un solo `<h1>` por página y sin saltos de nivel en los encabezados.
- Todas las imágenes con texto alternativo y todos los campos con su etiqueta.
- Errores de formulario asociados a su campo (`aria-invalid` y `aria-describedby`) y foco en el primer campo con error.
- Contraste de texto de al menos 4.5:1 en todas las pantallas.
- Sin desbordes horizontales en 320, 375, 768 y 1280 px de ancho.

## Defensa

En la defensa cada integrante debe poder explicar:

- Cómo está organizado el proyecto por módulos
- Cómo funcionan Vue Router y el guard de autenticación
- Cómo funciona Pinia con los stores del carrito y de la sesión
- Su propio módulo en detalle

Por eso es importante leer los Pull Requests de los demás, no solo aprobarlos.
