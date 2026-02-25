export const required = (msg: string) => (val: any) => !!val || msg
export const notEmpty = (msg: string) => (val: string) => (val && val.trim() !== '') || msg
export const isEmail = (msg: string) => (val: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val) || msg
}
export const matching = (target: any, msg: string) => (val: any) => target === val || msg

export const isFutureDate = (msg: string) => (val: string | Date) => {
  const date = val instanceof Date ? val : new Date(val)
  return date > new Date() || msg
}

export const isStrongPassword = (msg: string) => (val: string) => {
  if (import.meta.env.DEV) return true
  if (val.length < 8) return msg
  if (!/[a-z]/.test(val)) return msg
  if (!/\d/.test(val)) return msg
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) return msg
  return true
}
