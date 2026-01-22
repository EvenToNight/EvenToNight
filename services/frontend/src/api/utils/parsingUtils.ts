const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}[T:]\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z)?$/

export function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    const dateString = value.endsWith('Z') ? value : `${value}Z` //if not specified, treat as UTC
    return new Date(dateString)
  }
  return value
}
