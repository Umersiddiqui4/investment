export const safeLocalStorage = (callback: () => void, errorMessage: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        callback()
      }
    } catch (error) {
      console.warn(`[Storage Error] ${errorMessage}`, error)
    }
  }
  