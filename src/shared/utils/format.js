const priceFormatter = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' })

export function formatPrice(value) {
  return priceFormatter.format(value)
}
