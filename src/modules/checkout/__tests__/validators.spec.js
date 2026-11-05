import { describe, it, expect } from 'vitest'
import {
  validateName,
  validateEmail,
  validateAddress,
  validateCity,
  validateCardNumber,
  validateCardExp,
  validateCardCvv,
  validateCheckout,
} from '../validators'

describe('validators', () => {
  describe('validateName', () => {
    it('falla si está vacío o solo contiene espacios', () => {
      expect(validateName('')).toBe('El nombre completo es obligatorio')
      expect(validateName('   ')).toBe('El nombre completo es obligatorio')
    })

    it('pasa con un nombre válido', () => {
      expect(validateName('Jesús Quintero')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('falla si está vacío', () => {
      expect(validateEmail('')).toBe('El correo electrónico es obligatorio')
    })

    it('falla con formatos inválidos', () => {
      expect(validateEmail('no-email')).toBe('El correo electrónico no es válido')
      expect(validateEmail('test@')).toBe('El correo electrónico no es válido')
      expect(validateEmail('test@dominio')).toBe('El correo electrónico no es válido')
    })

    it('pasa con un correo válido', () => {
      expect(validateEmail('jesus@example.com')).toBe('')
    })
  })

  describe('validateAddress y validateCity', () => {
    it('valida que la dirección no esté vacía', () => {
      expect(validateAddress('')).toBe('La dirección es obligatoria')
      expect(validateAddress('Av. 5 de Julio')).toBe('')
    })

    it('valida que la ciudad no esté vacía', () => {
      expect(validateCity('')).toBe('La ciudad es obligatoria')
      expect(validateCity('Maracaibo')).toBe('')
    })
  })

  describe('validateCardNumber', () => {
    it('falla si está vacío', () => {
      expect(validateCardNumber('')).toBe('El número de tarjeta es obligatorio')
    })

    it('falla si no tiene 16 dígitos', () => {
      expect(validateCardNumber('12345678')).toBe('El número de tarjeta debe tener 16 dígitos')
      expect(validateCardNumber('12345678901234567')).toBe(
        'El número de tarjeta debe tener 16 dígitos',
      )
      expect(validateCardNumber('1234abcd5678efgh')).toBe(
        'El número de tarjeta debe tener 16 dígitos',
      )
    })

    it('acepta 16 dígitos con o sin espacios', () => {
      expect(validateCardNumber('1234567890123456')).toBe('')
      expect(validateCardNumber('1234 5678 9012 3456')).toBe('')
    })
  })

  describe('validateCardExp', () => {
    const refDate = new Date(2026, 10, 1) // Noviembre 2026 (mes 11)

    it('falla si está vacío', () => {
      expect(validateCardExp('', refDate)).toBe('La fecha de vencimiento es obligatoria')
    })

    it('falla con formato incorrecto o mes inválido', () => {
      expect(validateCardExp('13/26', refDate)).toBe('Formato inválido (debe ser MM/AA)')
      expect(validateCardExp('00/26', refDate)).toBe('Formato inválido (debe ser MM/AA)')
      expect(validateCardExp('5/26', refDate)).toBe('Formato inválido (debe ser MM/AA)')
      expect(validateCardExp('2026-11', refDate)).toBe('Formato inválido (debe ser MM/AA)')
    })

    it('falla si la tarjeta está vencida', () => {
      expect(validateCardExp('10/26', refDate)).toBe('La tarjeta está vencida')
      expect(validateCardExp('12/25', refDate)).toBe('La tarjeta está vencida')
    })

    it('pasa con fecha actual o futura', () => {
      expect(validateCardExp('11/26', refDate)).toBe('')
      expect(validateCardExp('12/26', refDate)).toBe('')
      expect(validateCardExp('05/28', refDate)).toBe('')
    })
  })

  describe('validateCardCvv', () => {
    it('falla si está vacío', () => {
      expect(validateCardCvv('')).toBe('El CVV es obligatorio')
    })

    it('falla si no tiene 3 o 4 dígitos', () => {
      expect(validateCardCvv('12')).toBe('El CVV debe tener 3 o 4 dígitos')
      expect(validateCardCvv('12345')).toBe('El CVV debe tener 3 o 4 dígitos')
      expect(validateCardCvv('abc')).toBe('El CVV debe tener 3 o 4 dígitos')
    })

    it('pasa con 3 o 4 dígitos numéricos', () => {
      expect(validateCardCvv('123')).toBe('')
      expect(validateCardCvv('1234')).toBe('')
    })
  })

  describe('validateCheckout', () => {
    const refDate = new Date(2026, 10, 1)

    it('detecta formulario incompleto y devuelve errores', () => {
      const { isValid, errors } = validateCheckout({}, refDate)
      expect(isValid).toBe(false)
      expect(errors.name).toBeTruthy()
      expect(errors.email).toBeTruthy()
      expect(errors.address).toBeTruthy()
      expect(errors.city).toBeTruthy()
      expect(errors.cardNumber).toBeTruthy()
      expect(errors.cardExp).toBeTruthy()
      expect(errors.cardCvv).toBeTruthy()
    })

    it('valida formulario completo y correcto', () => {
      const validForm = {
        name: 'Jesús Quintero',
        email: 'jesus@example.com',
        address: 'Calle 72',
        city: 'Maracaibo',
        cardNumber: '4532 1234 5678 9012',
        cardExp: '12/28',
        cardCvv: '123',
      }
      const { isValid, errors } = validateCheckout(validForm, refDate)
      expect(isValid).toBe(true)
      expect(Object.values(errors).every((e) => e === '')).toBe(true)
    })
  })
})

