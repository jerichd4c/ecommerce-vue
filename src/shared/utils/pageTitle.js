const APP_NAME = 'Ecommerce Vue'

// El título de la pestaña es lo primero que anuncia un lector de pantalla al cambiar de página
export function setPageTitle(title) {
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
}
