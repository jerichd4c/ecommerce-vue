# Guía para colaborar

Este documento explica cómo está construido el proyecto, qué convenciones seguimos y qué herramientas usamos. Si es tu primera vez en el proyecto, léelo completo antes de escribir código.

Para instalar y ejecutar la aplicación, y para ver quién es responsable de cada módulo, revisa el [README](README.md).

## Arquitectura

La aplicación es solo frontend. No hay backend ni base de datos propios: los datos vienen de la API pública DummyJSON.

El código está organizado **por funcionalidad** (módulos) y no por tipo de archivo. Todo lo que tiene que ver con el carrito vive en `modules/cart/`, todo lo del catálogo en `modules/catalog/`, y así con cada uno.

### Cómo viajan los datos

```
Vista (.vue)  ->  Store (Pinia)  ->  api.js del módulo  ->  http() en shared/http.js  ->  DummyJSON
     ^                |
     +----------------+
   la vista lee el estado del store y se actualiza sola
```

1. La **vista** muestra datos y reacciona a lo que hace el usuario.
2. El **store** guarda el estado y tiene las funciones que lo cambian (cargar productos, agregar al carrito, iniciar sesión).
3. **`api.js`** sabe qué endpoint usar y qué campos pedir. Lo tienen los módulos que hablan con la API (por ejemplo, `catalog` y `product`).
4. **`http()`** hace la llamada a la API. Agrega el token de sesión automáticamente si existe.

Las vistas no llaman a la API directamente; siempre lo hacen a través del store.

### Rutas

- Cada módulo declara sus rutas en su propio `routes.js`.
- `src/router/index.js` solo junta esas rutas, agrega la página 404 y registra el guard de autenticación.
- Todas las vistas se cargan de forma diferida (`() => import(...)`), así cada página es un archivo aparte y la carga inicial es más liviana.
- Cada ruta define `meta.title`. Después de cada navegación, el router lo usa para el título de la pestaña ("Carrito | Ecommerce Vue"). Si el título depende de datos (como el nombre de un producto), la vista llama a `setPageTitle` cuando los datos llegan.
- Al cambiar de página, `App.vue` lleva el foco al `<main>`, para que quien usa teclado o lector de pantalla no quede perdido.

### Protección de rutas

El guard está en `modules/auth/guards.js` y se ejecuta antes de cada navegación. Usa el campo `meta` de cada ruta:

| `meta`               | Qué pasa                                              |
| -------------------- | ----------------------------------------------------- |
| `requiresAuth: true` | Si no hay sesión, redirige a `/login?redirect=<ruta>` |
| `guestOnly: true`    | Si ya hay sesión, redirige al catálogo                |

Ejemplo: `/checkout` tiene `requiresAuth: true` y `/login` tiene `guestOnly: true`.

### Por qué `http.js` no importa el store de sesión

Para que `shared/` no dependa de ningún módulo. En `main.js` se registra de dónde sacar el token:

```js
setTokenProvider(() => useAuthStore().token)
```

Así `http.js` pide el token sin saber que existe el módulo `auth`.

La misma regla aplica a los componentes de `shared/`. Por ejemplo, `AppHeader` no importa los stores del carrito ni de la sesión: recibe `cartCount` e `isAuthenticated` como props y emite `logout`. Es `App.vue` quien lo conecta con los stores:

```vue
<AppHeader
  :cart-count="cart.count"
  :is-authenticated="auth.isAuthenticated"
  @logout="handleLogout"
/>
```

## Estructura de carpetas

```
src/
  main.js                 arranca la app: Pinia, router y proveedor del token
  App.vue                 layout general: enlace "saltar al contenido", header y <RouterView>;
                          conecta el header con los stores del carrito y de la sesión
  assets/
    main.css              variables de color, estilos base y clases globales
  router/
    index.js              junta las rutas de los módulos y registra el guard
  shared/
    http.js               cliente para la API
    components/
      AppHeader.vue       barra de navegación (recibe datos por props, no importa stores)
      BaseButton.vue      botón con variantes: primary, secondary, danger
      BaseInput.vue       campo con label, mensaje de error y atributos de accesibilidad
      LazyImage.vue       imagen que carga solo cuando está por aparecer en pantalla
    utils/
      format.js           formatPrice: muestra precios como $1,299.50
      pageTitle.js        setPageTitle: título de la pestaña ("Carrito | Ecommerce Vue")
    views/
      NotFoundView.vue    página 404
  modules/
    catalog/
      api.js              llamadas a la API del catálogo
      composables/
        useInfiniteScroll.js   avisa cuando el final de la lista se acerca a la pantalla
    product/
    cart/
    auth/
      __tests__/          pruebas del módulo
      views/              páginas del módulo
      components/         componentes que solo usa este módulo
      routes.js           rutas del módulo
      store.js            estado del módulo (Pinia)
      guards.js           guard de autenticación (solo en auth)
    checkout/
```

### Dónde va cada cosa

| Si vas a crear...                        | Va en...                                                  |
| ---------------------------------------- | --------------------------------------------------------- |
| Una página nueva                         | `modules/<modulo>/views/` y se registra en su `routes.js` |
| Un componente que solo usa un módulo     | `modules/<modulo>/components/`                            |
| Un componente que usan dos módulos o más | `shared/components/` (avisar al equipo)                   |
| Estado que comparten varias vistas       | El `store.js` del módulo                                  |
| Estado que solo usa un componente        | Un `ref` dentro del mismo componente                      |
| Llamadas a la API                        | `modules/<modulo>/api.js`, usando `http()`                |
| Lógica reutilizable con reactividad      | `modules/<modulo>/composables/use<Nombre>.js`             |
| Una función de ayuda que usan varios     | `shared/utils/` (por ejemplo, `formatPrice`)              |
| Una prueba                               | `modules/<modulo>/__tests__/<archivo>.spec.js`            |

### Cómo agregar un módulo nuevo

1. Crear la carpeta `src/modules/<nombre>/` con `views/` y `routes.js`.
2. Exportar las rutas en `routes.js`:

   ```js
   export default [
     {
       path: '/favoritos',
       name: 'favorites',
       component: () => import('./views/FavoritesView.vue'),
       meta: { title: 'Favoritos' },
     },
   ]
   ```

3. Importarlas en `src/router/index.js` y agregarlas al arreglo `routes`.
4. Si necesita estado, crear `store.js` con `defineStore`.

## Convenciones de código

### Vue

- Siempre `<script setup>` (Composition API). No usar Options API.
- Orden dentro del archivo: `<script setup>`, luego `<template>`, luego `<style scoped>`.
- Props declaradas con tipo y valor por defecto o `required`:

  ```js
  defineProps({
    product: { type: Object, required: true },
  })
  ```

- Para `v-model` en componentes propios, usar `defineModel()`.
- Para valores calculados a partir de otros, usar `computed`, no funciones en el template.
- `v-for` siempre con `:key` usando un id único, nunca el índice.

### Pinia

- Stores con la forma de función (setup store), igual que los que ya existen:

  ```js
  export const useCartStore = defineStore('cart', () => {
    const items = ref([])
    const total = computed(() => ...)
    function addItem(product) { ... }
    return { items, total, addItem }
  })
  ```

- El nombre del store es `use<Modulo>Store`.
- El estado solo se modifica con las funciones del store, no directamente desde las vistas.
- Si un store guarda datos en `localStorage`, hacerlo dentro del mismo store.

### Nombres

| Qué                          | Formato                        | Ejemplo                          |
| ---------------------------- | ------------------------------ | -------------------------------- |
| Componentes                  | PascalCase                     | `ProductCard.vue`                |
| Vistas                       | PascalCase terminado en `View` | `CartView.vue`                   |
| Componentes base compartidos | Prefijo `Base`                 | `BaseButton.vue`                 |
| Archivos JS                  | camelCase                      | `http.js`, `guards.js`           |
| Composables                  | camelCase con prefijo `use`    | `useInfiniteScroll.js`           |
| Variables y funciones        | camelCase                      | `fetchProducts`, `isLoading`     |
| Nombres de ruta              | minúscula                      | `catalog`, `product`, `checkout` |
| Ramas                        | `feature/<modulo>-<tarea>`     | `feature/cart-store`             |

### Estilo

El formato lo aplica Prettier automáticamente. La configuración del proyecto es:

- Sin punto y coma al final
- Comillas simples
- 2 espacios de sangría
- Máximo 100 caracteres por línea

No hay que memorizarlo: con la extensión de Prettier y "formatear al guardar" en el editor queda bien solo.

### CSS

- Estilos de cada componente con `<style scoped>`.
- Usar las variables de `src/assets/main.css` (`var(--color-primary)`, `var(--space)`, etc.) en lugar de valores fijos.
- Diseñar primero para celular y luego ampliar con `@media (min-width: ...)`.
- No usar `!important`.

### Estados de la interfaz

Toda vista que cargue datos debe manejar cuatro casos:

1. **Cargando**: mostrar un indicador o un esqueleto.
2. **Error**: mostrar un mensaje claro y, si se puede, un botón para reintentar.
3. **Vacío**: por ejemplo "No se encontraron productos" o "Tu carrito está vacío".
4. **Con datos**: el contenido normal.

### Accesibilidad

- Toda imagen con `alt` que describa lo que muestra.
- Todo campo de formulario con su `label` (`BaseInput` ya lo hace).
- Los mensajes de error deben estar asociados a su campo (`BaseInput` ya lo hace con `aria-describedby`).
- Usar `<button>` para acciones y `<RouterLink>` o `<a>` para navegar. No poner `@click` en un `<div>`.
- Todo debe poder usarse solo con el teclado (Tab, Enter, Espacio).
- No quitar el contorno de foco (`outline`).
- Cada página tiene un único `<h1>`.

## Herramientas

| Herramienta  | Para qué                                                 | Archivo de configuración         |
| ------------ | -------------------------------------------------------- | -------------------------------- |
| Vue 3        | Framework                                                | -                                |
| Vite         | Servidor de desarrollo y compilación                     | `vite.config.js`                 |
| Vue Router   | Navegación entre páginas                                 | `src/router/index.js`            |
| Pinia        | Manejo del estado                                        | stores en cada módulo            |
| ESLint       | Detecta errores y malas prácticas                        | `eslint.config.js`               |
| oxlint       | Revisión rápida de errores comunes                       | `.oxlintrc.json`                 |
| Prettier     | Formato del código                                       | `.prettierrc.json`               |
| EditorConfig | Sangría y fin de línea iguales en todos los editores     | `.editorconfig`                  |
| Vitest       | Pruebas                                                  | `vitest.config.js`               |
| Vue DevTools | Inspeccionar componentes, stores y rutas en el navegador | se activa sola con `npm run dev` |

### Editor recomendado

Visual Studio Code con estas extensiones (VS Code las sugiere al abrir el proyecto):

- Vue (Official)
- ESLint
- Prettier
- EditorConfig
- oxc
- Vitest

Activar en la configuración: **Format On Save**.

### Alias `@`

`@` apunta a `src/`. Usarlo para importar desde otra carpeta:

```js
import BaseButton from '@/shared/components/BaseButton.vue'
```

Dentro del mismo módulo se usan rutas relativas (`./store`).

### Variables de entorno

| Variable       | Valor                   |
| -------------- | ----------------------- |
| `VITE_API_URL` | `https://dummyjson.com` |

Están en `.env`, que no se sube al repositorio. Se crea copiando `.env.example`. Si agregas una variable nueva, agrégala también a `.env.example`.

## Pruebas

- Las pruebas usan Vitest y van en la carpeta `__tests__/` junto al código que prueban (por ejemplo, `modules/cart/__tests__/` o `shared/components/__tests__/`).
- Ejemplos de referencia:
  - Store: `modules/cart/__tests__/store.spec.js`
  - Vista: `modules/cart/__tests__/CartView.spec.js`
  - Con la API simulada: `modules/product/__tests__/store.spec.js` (usa `vi.mock` sobre `api.js` para no depender de la red)
- Priorizar las pruebas de la lógica de los stores (por ejemplo, que el total del carrito se calcule bien).
- Los stores del carrito y de la sesión guardan datos en `localStorage`. En las pruebas que los usen, llamar a `localStorage.clear()` en el `beforeEach`; si no, una prueba puede dejar datos que hagan fallar a otra.

```bash
npm run test:unit
```

Para detectar pruebas que dependen del orden, correrlas en orden aleatorio:

```bash
npx vitest run --sequence.shuffle
```

## Flujo de trabajo

El flujo completo de ramas, commits y Pull Requests está en el [README](README.md#cómo-trabajamos-con-git). Resumen:

1. Crear una rama desde `develop`: `feature/<modulo>-<tarea>`.
2. Commits con formato `tipo: descripción` (`feat`, `fix`, `style`, `refactor`, `docs`, `test`, `chore`).
3. Abrir un Pull Request hacia `develop`, con `Closes #N` si resuelve un issue.
4. Esperar una aprobación antes de hacer merge.

### Antes de abrir un Pull Request

- [ ] `npm run format` aplicado
- [ ] `npm run lint` sin errores
- [ ] `npx vitest run --sequence.shuffle` pasa
- [ ] `npm run build` termina bien
- [ ] Probado en tamaño celular y computadora
- [ ] Probado con el teclado
- [ ] Las vistas nuevas muestran los estados de cargando, error y vacío
- [ ] No hay `console.log` olvidados
- [ ] La descripción del PR explica qué se hizo y cómo probarlo
