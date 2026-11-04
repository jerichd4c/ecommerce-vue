import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// Llama a onIntersect cada vez que el elemento `target` se acerca a la pantalla
export function useInfiniteScroll(target, onIntersect, { watchSource, rootMargin = '300px' } = {}) {
  let observer

  // Volver a observar hace que el observer revise el estado actual.
  // Sirve cuando, después de cargar, el elemento sigue visible (pantallas grandes)
  function recheck() {
    if (!observer || !target.value) return
    observer.unobserve(target.value)
    observer.observe(target.value)
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect()
      },
      { rootMargin },
    )
    observer.observe(target.value)
  })

  if (watchSource) watch(watchSource, () => nextTick(recheck))

  onBeforeUnmount(() => observer?.disconnect())
}
