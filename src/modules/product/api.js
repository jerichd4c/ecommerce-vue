import { http } from '@/shared/http'

// Solo los campos que usa la vista y el carrito, porque el producto se guarda en localStorage
const FIELDS = 'title,description,price,thumbnail,images'

export function fetchProduct(id) {
  const params = new URLSearchParams({ select: FIELDS })
  return http(`/products/${encodeURIComponent(id)}?${params}`)
}
