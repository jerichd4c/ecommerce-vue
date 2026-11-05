import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

function mountHeader(props) {
  return mount(AppHeader, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

function findLink(wrapper, to) {
  return wrapper.findAllComponents(RouterLinkStub).find((link) => link.props('to') === to)
}

describe('AppHeader', () => {
  it('muestra el contador del carrito', () => {
    const wrapper = mountHeader({ cartCount: 3 })

    expect(wrapper.find('.app-header__count').text()).toBe('3')
  })

  it('describe el contador en singular y en plural', () => {
    const uno = mountHeader({ cartCount: 1 })
    const varios = mountHeader({ cartCount: 2 })

    expect(findLink(uno, '/cart').attributes('aria-label')).toBe('Carrito, 1 producto')
    expect(findLink(varios, '/cart').attributes('aria-label')).toBe('Carrito, 2 productos')
  })

  it('muestra "Iniciar sesión" si no hay sesión', () => {
    const wrapper = mountHeader({ isAuthenticated: false })

    expect(findLink(wrapper, '/login').text()).toBe('Iniciar sesión')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('muestra "Cerrar sesión" si hay sesión y avisa al hacer clic', async () => {
    const wrapper = mountHeader({ isAuthenticated: true })
    const button = wrapper.find('button')

    expect(button.text()).toBe('Cerrar sesión')
    expect(findLink(wrapper, '/login')).toBeUndefined()

    await button.trigger('click')

    expect(wrapper.emitted('logout')).toHaveLength(1)
  })
})
