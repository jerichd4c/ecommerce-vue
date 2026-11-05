const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(name) {
  if (!name || !name.trim()) {
    return 'El nombre completo es obligatorio'
  }
  return ''
}

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'El correo electrónico es obligatorio'
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'El correo electrónico no es válido'
  }
  return ''
}

export function validateAddress(address) {
  if (!address || !address.trim()) {
    return 'La dirección es obligatoria'
  }
  return ''
}

export function validateCity(city) {
  if (!city || !city.trim()) {
    return 'La ciudad es obligatoria'
  }
  return ''
}

export function validateCardNumber(cardNumber) {
  if (!cardNumber || !cardNumber.trim()) {
    return 'El número de tarjeta es obligatorio'
  }
  const digitsOnly = cardNumber.replace(/\s+/g, '')
  if (!/^\d{16}$/.test(digitsOnly)) {
    return 'El número de tarjeta debe tener 16 dígitos'
  }
  return ''
}

export function validateCardExp(cardExp, referenceDate = new Date()) {
  if (!cardExp || !cardExp.trim()) {
    return 'La fecha de vencimiento es obligatoria'
  }

  const match = cardExp.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!match) {
    return 'Formato inválido (debe ser MM/AA)'
  }

  const expMonth = parseInt(match[1], 10)
  const expYear = 2000 + parseInt(match[2], 10)

  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1 // 1 a 12

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return 'La tarjeta está vencida'
  }

  return ''
}

export function validateCardCvv(cvv) {
  if (!cvv || !cvv.trim()) {
    return 'El CVV es obligatorio'
  }
  const trimmed = cvv.trim()
  if (!/^\d{3,4}$/.test(trimmed)) {
    return 'El CVV debe tener 3 o 4 dígitos'
  }
  return ''
}

export function validateCheckout(form, referenceDate = new Date()) {
  const errors = {
    name: validateName(form.name),
    email: validateEmail(form.email),
    address: validateAddress(form.address),
    city: validateCity(form.city),
    cardNumber: validateCardNumber(form.cardNumber),
    cardExp: validateCardExp(form.cardExp, referenceDate),
    cardCvv: validateCardCvv(form.cardCvv),
  }

  const isValid = Object.values(errors).every((error) => !error)

  return { isValid, errors }
}
