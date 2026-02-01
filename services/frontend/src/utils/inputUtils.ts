export const preventInvalidNumberKeys = (event: KeyboardEvent) => {
  const invalidKeys = ['e', 'E', '+', '-', '.']
  if (invalidKeys.includes(event.key)) {
    event.preventDefault()
  }
}
