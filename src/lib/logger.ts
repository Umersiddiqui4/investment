export const logger = {
    warn: (message: string, error?: unknown) => {
      console.warn(`[API Client] ${message}`, error)
    },
    error: (message: string, error?: unknown) => {
      console.error(`[API Client] ${message}`, error)
    },
    info: (message: string, data?: unknown) => {
      console.info(`[API Client] ${message}`, data)
    },
  }
  