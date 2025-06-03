export class BrowserStorage {
  static setCookie(name: string, value: string) {
    if (typeof window !== "undefined") {
      document.cookie = `${name}=${value}; path=/; secure; SameSite=Strict`;
    }
  }

  static getCookie(name: string): string | undefined | null {
    if (typeof window === "undefined") return null;

    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return cookieMatch ? cookieMatch.split("=")[1] : null;
  }

  static deleteCookie(name: string) {
    if (typeof window !== "undefined") {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
  }

  static setLocalStorage(name: string, value: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  }

  static getLocalStorage(name: string): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(name);
  }

  static deleteLocalStorage(name: string) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  }

  static setSessionStorage(name: string, value: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(name, value);
    }
  }

  static getSessionStorage(name: string): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(name);
  }

  static deleteSessionStorage(name: string) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(name);
    }
  }
}
