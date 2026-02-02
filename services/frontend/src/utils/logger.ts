const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args)
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: any[]) => {
    console.error(...args)
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args)
  },
}

export const createLogger = (namespaceOrUrl: string) => {
  let namespace = namespaceOrUrl

  // If it looks like a URL/path, extract the filename
  if (namespaceOrUrl.includes('/')) {
    const filename =
      namespaceOrUrl
        .split('/')
        .pop()
        ?.replace(/\?.*$/, '')
        ?.replace(/\.(vue|ts|js)$/, '') || 'Unknown'
    namespace = filename
  }

  const prefix = `[${namespace}]`

  return {
    log: (...args: any[]) => {
      if (isDev) console.log(prefix, ...args)
    },
    info: (...args: any[]) => {
      if (isDev) console.info(prefix, ...args)
    },
    warn: (...args: any[]) => {
      if (isDev) console.warn(prefix, ...args)
    },
    error: (...args: any[]) => {
      console.error(prefix, ...args)
    },
    debug: (...args: any[]) => {
      if (isDev) console.debug(prefix, ...args)
    },
  }
}
