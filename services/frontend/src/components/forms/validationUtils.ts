export const required = (msg: string) => (val: any) => !!val || msg
export const notEmpty = (msg: string) => (val: string) => (val && val.trim() !== '') || msg
export const isEmail = (msg: string) => (val: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(val) || msg
}
export const matching = (target: any, msg: string) => (val: any) => target === val || msg
