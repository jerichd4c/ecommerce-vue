import { http } from '@/shared/http'

// Solo los campos que muestra la tarjeta, para que cada página pese menos
const FIELDS = 'title,price,thumbnail,category'

export function fetchCategories() {
  return http('/products/categories')
}

export async function fetchProducts({ search, category, skip, limit }) {
  const page = new URLSearchParams({ limit, skip, select: FIELDS })

  if (search && category) {
    // DummyJSON no permite buscar dentro de una categoría:
    // se traen todos los resultados de la búsqueda y se filtran aquí
    const params = new URLSearchParams({ q: search, limit: 0, select: FIELDS })
    const data = await http(`/products/search?${params}`)
    const products = data.products.filter((p) => p.category === category)
    return { products, total: products.length }
  }

  if (search) {
    page.set('q', search)
    return http(`/products/search?${page}`)
  }

  if (category) {
    return http(`/products/category/${encodeURIComponent(category)}?${page}`)
  }

  return http(`/products?${page}`)
}
